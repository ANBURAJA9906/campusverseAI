import React, { createContext, useContext, useState, useEffect } from 'react';

const CampusContext = createContext();

export const useCampus = () => useContext(CampusContext);

export const CampusProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [dashboard, setDashboard] = useState({
    joinedClubs: [],
    registeredEvents: [],
    activePlans: [],
    activeReminders: []
  });
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'agent',
      text: "Welcome to CampusVerse AI, Aarav! I am your central Planner Agent. How can I assist you today? You can use one of the quick actions below to run proactive agentic workflows.",
      timestamp: new Date().toLocaleTimeString(),
      reasoningSteps: [],
      agentCollaborations: []
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [activeWidget, setActiveWidget] = useState(null); // The dynamic widget payload for the latest query
  const [recommendations, setRecommendations] = useState(null);
  const [activeAgent, setActiveAgent] = useState('PlannerAgent');
  const [view, setView] = useState('dashboard'); // 'dashboard', 'analytics' — the old unauthenticated
  // in-app 'admin' view has been retired; staff/admin management now lives in the
  // separate authenticated console at /admin (see src/admin/).
  const [activeDashboardTab, setActiveDashboardTab] = useState('profile'); // 'profile', 'schedule', 'academic', 'placement', 'map', 'community', 'campus'
  const [isListening, setIsListening] = useState(false);

  // AI Senior Mentor Community — feed of posts/comments, backed by
  // /api/community (routes/communityRoutes.js).
  const [communityPosts, setCommunityPosts] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(false);

  // Smart Library & Hostel Information — read-only listings backed by
  // /api/hostels and /api/library (server.js).
  const [hostels, setHostels] = useState([]);
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [campusResourcesLoading, setCampusResourcesLoading] = useState(false);

  const backendUrl = 'http://localhost:5000/api';

  const loadStudentData = async () => {
    try {
      const response = await fetch(`${backendUrl}/student`);
      const data = await response.json();
      if (data.student) {
        setStudent(data.student);
        setDashboard(data.dashboard);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await fetch(`${backendUrl}/student/recommendations`);
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  useEffect(() => {
    loadStudentData();
    loadRecommendations();
  }, []);

  // `mode` is 'text' (default, typed input) or 'voice' (captured by the
  // browser's Web Speech API and sent to the dedicated voice endpoint,
  // /api/agent/voice — see server.js). Both routes run the exact same
  // orchestrateQuery pipeline; voice mode additionally speaks the reply
  // back with SpeechSynthesis once the response arrives.
  const sendChatMessage = async (queryText, mode = 'text') => {
    if (!queryText.trim()) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString(),
      inputMode: mode
    };
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);
    setActiveAgent('IntentAgent');

    try {
      const endpoint = mode === 'voice' ? `${backendUrl}/agent/voice` : `${backendUrl}/agent/chat`;
      const payload = mode === 'voice' ? { transcript: queryText } : { query: queryText };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      // Simulate a small delay for realistic multi-agent execution feel
      await new Promise(resolve => setTimeout(resolve, 800));

      // Sync dashboard state
      if (result.dashboardSync) {
        setDashboard(result.dashboardSync);
      }

      // Add agent response with streaming effect
      const fullText = getAgentTextResponse(result.intent, result.data);
      const agentMsg = {
        sender: 'agent',
        text: '',
        timestamp: new Date().toLocaleTimeString(),
        reasoningSteps: result.reasoningSteps,
        agentCollaborations: result.agentCollaborations,
        intent: result.intent,
        data: result.data,
        isStreaming: true
      };

      setChatHistory(prev => [...prev, agentMsg]);
      setActiveWidget({ intent: result.intent, data: result.data });

      // Voice-originated turns get spoken back immediately (don't wait for
      // the word-by-word streaming animation below to finish).
      if (mode === 'voice' && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.rate = 1.02;
        window.speechSynthesis.speak(utterance);
      }

      // Stream text word by word
      const words = fullText.split(' ');
      let currentText = '';
      let wordIndex = 0;
      
      const streamInterval = setInterval(() => {
        if (wordIndex < words.length) {
          currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
          setChatHistory(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.sender === 'agent' && last.isStreaming) {
              last.text = currentText;
            }
            return next;
          });
          wordIndex++;
        } else {
          clearInterval(streamInterval);
          setChatHistory(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.sender === 'agent' && last.isStreaming) {
              last.isStreaming = false;
            }
            return next;
          });
        }
      }, 40);

      // Automatically switch active dashboard tab based on intent
      if (result.intent === 'JOIN_CLUB') {
        setActiveDashboardTab('profile');
      } else if (result.intent === 'EXAM_PREP') {
        setActiveDashboardTab('schedule');
      } else if (result.intent === 'PLACEMENT_PREP') {
        setActiveDashboardTab('placement');
      } else if (result.intent === 'NAVIGATION') {
        setActiveDashboardTab('map');
      }

      // Refresh recommendations
      loadRecommendations();

    } catch (error) {
      console.error('Error sending chat message:', error);
      setChatHistory(prev => [...prev, {
        sender: 'agent',
        text: 'Sorry Aarav, I encountered an issue connecting to the central agent planner server.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
      setActiveAgent('PlannerAgent');
    }
  };

  const getAgentTextResponse = (intent, data) => {
    switch (intent) {
      case 'JOIN_CLUB':
        return `Task accomplished! I have successfully registered you in the ${data.clubName}, added it to your profile, scheduled the upcoming orientation, and created calendar reminders. Here are the club coordinators and WhatsApp links.`;
      case 'CAMPUS_UPDATES':
        return `I have generated your Daily Campus Digest! I collected announcements from the administrator dashboard, summarized key notices, and highlighted urgent hackathon and drive deadlines.`;
      case 'EXAM_PREP':
        return `I have prepared a personalized study plan for your ${data.subject} exam. I checked book availability, curated learning playlists, and added a 7-day revision schedule to your calendar.`;
      case 'PLACEMENT_PREP':
        return `I have analyzed your branch and generated your SDE Placement Roadmap! Here are your DSA checklists, recommended projects matching your skills, and registration links for upcoming drives.`;
      case 'HACKATHON_DISCOVERY':
        return `Found active hackathons! I filtered duplicate posts and sorted them by deadline. I also found matching teammates in our student directory who complement your React/Python stack.`;
      case 'NAVIGATION':
        return `Activated navigation routing. I've highlighted the route to the ${data.destination} on the interactive campus map. Walking time is approximately ${data.duration} mins. Nearby facilities have been highlighted.`;
      default:
        return data.message || "How else can I assist you on your campus journey?";
    }
  };

  // ---------- AI Senior Mentor Community ----------
  const loadCommunityPosts = async () => {
    setCommunityLoading(true);
    try {
      const response = await fetch(`${backendUrl}/community/posts`);
      const data = await response.json();
      setCommunityPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching community posts:', error);
    } finally {
      setCommunityLoading(false);
    }
  };

  const createCommunityPost = async ({ title, content, tags }) => {
    const response = await fetch(`${backendUrl}/community/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, tags })
    });
    const result = await response.json();
    if (result.success) {
      await loadCommunityPosts();
    }
    return result;
  };

  const addCommunityComment = async (postId, content) => {
    const response = await fetch(`${backendUrl}/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    const result = await response.json();
    if (result.success) {
      await loadCommunityPosts();
    }
    return result;
  };

  // ---------- Smart Library & Hostel Information ----------
  const loadCampusResources = async () => {
    setCampusResourcesLoading(true);
    try {
      const [hostelRes, libraryRes] = await Promise.all([
        fetch(`${backendUrl}/hostels`),
        fetch(`${backendUrl}/library`)
      ]);
      const hostelData = await hostelRes.json();
      const libraryData = await libraryRes.json();
      setHostels(Array.isArray(hostelData) ? hostelData : []);
      setLibraryBooks(Array.isArray(libraryData) ? libraryData : []);
    } catch (error) {
      console.error('Error fetching hostel/library data:', error);
    } finally {
      setCampusResourcesLoading(false);
    }
  };

  return (
    <CampusContext.Provider value={{
      student,
      dashboard,
      chatHistory,
      loading,
      activeWidget,
      setActiveWidget,
      recommendations,
      activeAgent,
      setActiveAgent,
      view,
      setView,
      activeDashboardTab,
      setActiveDashboardTab,
      sendChatMessage,
      loadStudentData,
      backendUrl,
      isListening,
      setIsListening,
      communityPosts,
      communityLoading,
      loadCommunityPosts,
      createCommunityPost,
      addCommunityComment,
      hostels,
      libraryBooks,
      campusResourcesLoading,
      loadCampusResources
    }}>
      {children}
    </CampusContext.Provider>
  );
};
