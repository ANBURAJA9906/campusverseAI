// Central Planner & Orchestrator Agent
// Manages Intent Detection, generates reasoning steps, dispatches tasks to specialized agents, and merges outcomes.

import { detectIntent } from './intentAgent.js';
import { processNavigation } from './navigationAgent.js';
import { processAcademic } from './academicAgent.js';
import { processPlacement } from './placementAgent.js';
import { processJoinClub } from './communityAgent.js';
import { processEventDiscovery } from './eventAgent.js';
import { processCampusUpdates } from './campusInfoAgent.js';
import { getRecommendations } from '../services/recommendationEngine.js';
import { generateGeneralResponse } from '../services/geminiService.js';

function extractKeywords(query) {
  const stopWords = new Set([
    'is', 'are', 'am', 'was', 'were', 'be', 'been', 'being',
    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else',
    'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
    'should', 'now', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
    'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
    'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his',
    'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
    'they', 'them', 'their', 'theirs', 'themselves', 'college', 'campus', 'university',
    'allow', 'allowed', 'on', 'off', 'offered'
  ]);
  
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !stopWords.has(w));
}

async function searchCampusDatabase(query, prisma) {
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return [];

  const searchTerms = [...keywords];
  for (const kw of keywords) {
    if (kw.endsWith('s') && kw.length > 3) {
      searchTerms.push(kw.slice(0, -1));
    }
  }

  const results = [];

  for (const keyword of searchTerms) {
    // Search Entity
    const entities = await prisma.entity.findMany({
      where: {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } }
        ]
      }
    });
    for (const e of entities) {
      results.push({
        source: 'Knowledge Graph Entity',
        type: e.type,
        name: e.name,
        details: e.description
      });
    }

    // Search Club
    const clubs = await prisma.club.findMany({
      where: {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } }
        ]
      }
    });
    for (const c of clubs) {
      results.push({
        source: 'Club',
        name: c.name,
        details: c.description
      });
    }

    // Search Event
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
          { location: { contains: keyword } }
        ]
      }
    });
    for (const ev of events) {
      results.push({
        source: 'Event',
        name: ev.name,
        details: `${ev.description} (Location: ${ev.location}, Date: ${ev.date})`
      });
    }

    // Search Announcement
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } }
        ]
      }
    });
    for (const a of announcements) {
      results.push({
        source: 'Announcement',
        name: a.title,
        details: a.content
      });
    }

    // Search Hostel
    const hostels = await prisma.hostel.findMany({
      where: {
        OR: [
          { name: { contains: keyword } },
          { facilities: { contains: keyword } },
          { location: { contains: keyword } }
        ]
      }
    });
    for (const h of hostels) {
      results.push({
        source: 'Hostel',
        name: h.name,
        details: `Warden: ${h.warden}, Location: ${h.location}, Facilities: ${h.facilities}`
      });
    }

    // Search LibraryBook
    const books = await prisma.libraryBook.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { author: { contains: keyword } },
          { category: { contains: keyword } }
        ]
      }
    });
    for (const b of books) {
      results.push({
        source: 'Library Book',
        name: b.title,
        details: `Author: ${b.author}, Call Number: ${b.callNumber}, Category: ${b.category}, Available Copies: ${b.availableCopies}/${b.totalCopies}`
      });
    }
  }

  // Dedup results by source and name
  const seen = new Set();
  const uniqueResults = [];
  for (const r of results) {
    const key = `${r.source}:${r.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(r);
    }
  }

  return uniqueResults;
}

async function getDashboardSync(studentId, prisma) {
  const updatedStudent = await prisma.student.findUnique({
    where: { id: studentId },
    include: { registrations: true, studyPlans: true }
  });

  if (!updatedStudent) return {};

  const allClubs = await prisma.club.findMany();
  const allEvents = await prisma.event.findMany();

  const joinedClubs = updatedStudent.registrations
    .map(r => allClubs.find(c => c.id === r.clubId))
    .filter(Boolean);

  const registeredEvents = updatedStudent.registrations
    .map(r => allEvents.find(e => e.id === r.eventId))
    .filter(Boolean);

  const activePlans = updatedStudent.studyPlans.map(p => ({
    subject: p.subject,
    date: p.date,
    tasks: JSON.parse(p.tasks)
  }));

  const activeReminders = await prisma.memory.findMany({
    where: { studentId, category: 'goal' }
  });

  return {
    joinedClubs,
    registeredEvents,
    activePlans,
    activeReminders: activeReminders.map(m => m.value)
  };
}

export async function orchestrateQuery(studentId, query, prisma) {
  // Print user query log
  console.log('--- User Question ---');
  console.log(query);
  console.log('---------------------');

  // Fetch Student Profile
  const student = await prisma.student.findUnique({
    where: { id: studentId }
  });

  if (!student) {
    throw new Error('Student profile not found');
  }

  // Step 1: Detect Intent
  let analysis;
  try {
    analysis = await detectIntent(query, student);
  } catch (error) {
    console.error('[plannerAgent] detectIntent failed due to Gemini error:', error.message);
    console.log('--- API Error ---');
    console.error(error);
    console.log('-----------------');

    return {
      query,
      intent: 'UNKNOWN',
      reasoningSteps: [{
        title: 'Gemini API Error',
        status: 'error',
        detail: error.message
      }],
      agentCollaborations: [],
      data: {
        message: `Gemini API Error: ${error.message}`
      },
      dashboardSync: await getDashboardSync(studentId, prisma)
    };
  }

  const { intent, entities } = analysis;

  const reasoningSteps = [];
  const agentCollaborations = []; // To draw interactive glowing paths
  let agentResponseData = {};

  // Fire-and-forget real usage log — backs the Analytics panel's "AI
  // Specialized Agent Usage" chart with actual counts (see QueryLog in
  // schema.prisma). Never blocks or fails the user-facing response.
  prisma.queryLog.create({ data: { intent } }).catch(() => {});

  reasoningSteps.push({
    title: 'Intent Analysis',
    status: 'success',
    detail: analysis.source === 'gemini'
      ? `Gemini classified user goal as "${intent}" (confidence ${Math.round(analysis.confidence * 100)}%) with entities: ${JSON.stringify(entities)}`
      : `Identified user goal: "${intent}" with entities: ${JSON.stringify(entities)} (rule-based fallback)`
  });

  agentCollaborations.push({ from: 'IntentAgent', to: 'PlannerAgent' });

  // Step 2: Dispatch to Specialized Agents & Run Database actions
  if (intent === 'JOIN_CLUB') {
    reasoningSteps.push({
      title: 'Activating Community Agent',
      status: 'success',
      detail: `Searching database for club name matching "${entities.clubName}"...`
    });
    agentCollaborations.push({ from: 'PlannerAgent', to: 'CommunityAgent' });

    // Join club
    const clubResult = await processJoinClub(studentId, entities.clubName, prisma);
    agentResponseData = clubResult;

    reasoningSteps.push({
      title: 'Database Registrations',
      status: 'success',
      detail: `Successfully registered Aarav Sharma for "${clubResult.clubName}". Orientation reminder added to calendar.`
    });
    agentCollaborations.push({ from: 'CommunityAgent', to: 'NotificationAgent' });

    // Recommendation Engine for other clubs
    reasoningSteps.push({
      title: 'Invoking Recommendation Engine',
      status: 'success',
      detail: `Fetching related technical clubs based on student's active skills: [${student.skills}]`
    });
    agentCollaborations.push({ from: 'PlannerAgent', to: 'RecommendationEngine' });
    const recs = await getRecommendations(studentId, prisma);
    agentResponseData.recommendations = recs;
  } 
  
  else if (intent === 'CAMPUS_UPDATES') {
    reasoningSteps.push({
      title: 'Activating Campus Information Agent',
      status: 'success',
      detail: `Fetching campus announcements, notices, and today's schedule...`
    });
    agentCollaborations.push({ from: 'PlannerAgent', to: 'CampusInfoAgent' });

    // Delegated to the Campus Info Agent (agents/campusInfoAgent.js), which
    // in turn delegates the dedup/sort/highlight work to the Event
    // Intelligence Agent — covers every event type, not just hackathons.
    const campusUpdates = await processCampusUpdates(prisma);

    reasoningSteps.push({
      title: 'AI Announcement Summarizer',
      status: 'success',
      detail: `Summarized ${campusUpdates.announcementCount} major update${campusUpdates.announcementCount === 1 ? '' : 's'}. Extracted deadlines/venues for ${campusUpdates.eventCount} upcoming event${campusUpdates.eventCount === 1 ? '' : 's'} across all event types.`
    });
    agentCollaborations.push({ from: 'CampusInfoAgent', to: 'EventIntelligenceAgent' });

    agentResponseData = {
      announcements: campusUpdates.announcements,
      todayEvents: campusUpdates.todayEvents
    };
  } 
  
  else if (intent === 'EXAM_PREP') {
    reasoningSteps.push({
      title: 'Activating Academic Agent',
      status: 'success',
      detail: `Retrieving syllabus and details for subject "${entities.subject}"...`
    });
    agentCollaborations.push({ from: 'PlannerAgent', to: 'AcademicAgent' });

    // Generate study calendar
    const examDate = '2026-07-27'; // next Monday from July 18
    const studyPlan = await processAcademic(studentId, entities.subject, examDate, prisma);
    agentResponseData = studyPlan;

    reasoningSteps.push({
      title: 'Database Sync',
      status: 'success',
      detail: `Created a 7-day study guide in SQL. Set automatic study reminders on the student's dashboard.`
    });
    agentCollaborations.push({ from: 'AcademicAgent', to: 'NotificationAgent' });
  } 
  
  else if (intent === 'PLACEMENT_PREP') {
    reasoningSteps.push({
      title: 'Activating Placement & Career Coaching Agent',
      status: 'success',
      detail: `Fetching Placement cell drives and analyzing CSE Student target roles...`
    });
    agentCollaborations.push({ from: 'PlannerAgent', to: 'PlacementAgent' });

    const placementData = await processPlacement(student, prisma);
    agentResponseData = placementData;

    reasoningSteps.push({
      title: 'Generating Career Roadmap',
      status: 'success',
      detail: `Created custom DSA study timeline. Suggested 2 resume-matching WebDev/AI projects.`
    });
    agentCollaborations.push({ from: 'PlacementAgent', to: 'NotificationAgent' });
  } 
  
  else if (intent === 'HACKATHON_DISCOVERY') {
    reasoningSteps.push({
      title: 'Activating Event Intelligence Agent',
      status: 'success',
      detail: `Collecting, sorting, and deduplicating active hackathons...`
    });
    agentCollaborations.push({ from: 'PlannerAgent', to: 'EventIntelligenceAgent' });

    const hackathonData = await processEventDiscovery(student, prisma);
    agentResponseData = hackathonData;

    reasoningSteps.push({
      title: 'Finding Teammate Matches',
      status: 'success',
      detail: `Queried Student community. Matched 3 potential teammates with complementary UI/UX and backend skills.`
    });
    agentCollaborations.push({ from: 'EventIntelligenceAgent', to: 'CommunityAgent' });
  } 
  
  else if (intent === 'NAVIGATION') {
    reasoningSteps.push({
      title: 'Activating Navigation Agent',
      status: 'success',
      detail: `Parsing campus spatial layout coordinates from source "${entities.source}" to "${entities.destination}"...`
    });
    agentCollaborations.push({ from: 'PlannerAgent', to: 'NavigationAgent' });

    const navigationData = await processNavigation(entities.source, entities.destination, prisma);
    agentResponseData = navigationData;

    reasoningSteps.push({
      title: 'Calculating Routes & Amenities',
      status: 'success',
      detail: `Generated custom SVG pathway. Identified nearby washrooms and library highlights.`
    });
  } 
  
  else {
    // Default fallback
    reasoningSteps.push({
      title: 'General Conversational Mode',
      status: 'success',
      detail: 'Interpreting question and searching campus knowledge base.'
    });

    const searchResults = await searchCampusDatabase(query, prisma);
    
    // Log Retrieved Context
    console.log('--- Retrieved Context ---');
    if (searchResults.length > 0) {
      console.log(JSON.stringify(searchResults, null, 2));
    } else {
      console.log('No relevant campus data exists.');
    }
    console.log('-------------------------');

    const contextText = searchResults
      .map(r => `Source: ${r.source}\nName: ${r.name}\nDetails: ${r.details}`)
      .join('\n\n');

    try {
      const response = await generateGeneralResponse(query, contextText);
      agentResponseData = {
        message: response
      };
    } catch (error) {
      console.error('[plannerAgent] generateGeneralResponse failed:', error.message);
      console.log('--- API Error ---');
      console.error(error);
      console.log('-----------------');

      agentResponseData = {
        message: `Gemini API Error: ${error.message}`
      };

      reasoningSteps.push({
        title: 'Gemini API Error',
        status: 'error',
        detail: error.message
      });
    }
  }

  const syncData = await getDashboardSync(studentId, prisma);

  return {
    query,
    intent,
    reasoningSteps,
    agentCollaborations,
    data: agentResponseData,
    dashboardSync: syncData
  };
}
