import React, { useState, useRef, useEffect } from 'react';
import { CampusProvider, useCampus } from './context/CampusContext';
import { 
  Sparkles, Send, Calendar, MapPin, Award, Shield, 
  TrendingUp, User, BookOpen, Layers, Terminal, 
  ArrowRight, Activity, Network, BookOpenCheck, Clock, CheckCircle2,
  Users, Building2, MessageSquare, Compass, Info, Map, Download, Mail, ImagePlus,
  Search
} from 'lucide-react';

// Import Widgets
import AIClubWidget from './components/widgets/AIClubWidget';
import CampusMapWidget from './components/widgets/CampusMapWidget';
import DailyDigestWidget from './components/widgets/DailyDigestWidget';
import HackathonWidget from './components/widgets/HackathonWidget';
import PlacementRoadmapWidget from './components/widgets/PlacementRoadmapWidget';
import StudyPlanWidget from './components/widgets/StudyPlanWidget';
import AgentCollaborationWeb from './components/widgets/AgentCollaborationWeb';
import CommunityFeedTab from './components/widgets/CommunityFeedTab';
import CampusResourcesTab from './components/widgets/CampusResourcesTab';

import AnalyticsPanel from './components/AnalyticsPanel';
import VoiceInputButton from './components/VoiceInputButton';
import ThemeToggle from './components/ThemeToggle';

// Custom inline parser to render markdown details nicely
const renderMarkdown = (text) => {
  if (!text) return '';
  // Bold
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan font-bold">$1</strong>');
  // Inline Code
  html = html.replace(/`(.*?)`/g, '<code class="font-mono text-cyan" style="background: rgba(255,255,255,0.06); padding: 2px 5px; border-radius: 4px;">$1</code>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

function AppContent() {
  const { 
    student, dashboard, chatHistory, loading, activeWidget,
    recommendations, activeAgent, view, setView,
    activeDashboardTab, setActiveDashboardTab, sendChatMessage 
  } = useCampus();

  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  // Which flavor of the 'dashboard' view is showing: the chat/agent console,
  // or one of the 7 campus tabs rendered full-width. Local UI state only —
  // doesn't touch CampusContext's view/activeDashboardTab wiring.
  const [dashboardMode, setDashboardMode] = useState('tabs');
  const [searchQuery, setSearchQuery] = useState('');

  const campusTabs = [
    { id: 'profile', label: 'Dashboard', icon: User },
    { id: 'schedule', label: 'My Schedule', icon: Calendar },
    { id: 'academic', label: 'Academic OS', icon: BookOpenCheck },
    { id: 'placement', label: 'DSA & Drives', icon: Award },
    { id: 'map', label: 'Interactive Map', icon: MapPin },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'campus', label: 'Hostel & Library', icon: Building2 }
  ];

  const goToConsole = () => { setView('dashboard'); setDashboardMode('console'); };
  const goToTab = (tabId) => { setView('dashboard'); setDashboardMode('tabs'); setActiveDashboardTab(tabId); };
  const isConsoleActive = view === 'dashboard' && dashboardMode === 'console';
  const isTabActive = (tabId) => view === 'dashboard' && dashboardMode === 'tabs' && activeDashboardTab === tabId;

  // Quick Action Scenarios matching the demo workflows
  const quickActions = [
    { label: 'Join AI Club', query: 'Join me to the AI Club', icon: UsersIcon },
    { label: 'Today\'s Updates', query: 'Summarize today\'s college updates', icon: NewspaperIcon },
    { label: 'DBMS Exam Prep', query: 'I have a DBMS exam next week', icon: BookOpenIcon },
    { label: 'Placement Roadmap', query: 'I\'m interested in SDE placements', icon: PlacementIcon },
    { label: 'Hackathons Search', query: 'I want to participate in hackathons', icon: AwardIcon },
    { label: 'Directions to Lab', query: 'I need to go to Programming Lab', icon: MapPinIcon }
  ];

  // Icons helper for quick actions
  function UsersIcon() { return <Network className="w-3.5 h-3.5 text-cyan" /> }
  function NewspaperIcon() { return <Layers className="w-3.5 h-3.5 text-purple" /> }
  function BookOpenIcon() { return <BookOpen className="w-3.5 h-3.5 text-amber" /> }
  function PlacementIcon() { return <Award className="w-3.5 h-3.5 text-emerald" /> }
  function AwardIcon() { return <Award className="w-3.5 h-3.5 text-purple" /> }
  function MapPinIcon() { return <MapPin className="w-3.5 h-3.5 text-cyan" /> }

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendChatMessage(input);
    setInput('');
  };

  // Find latest agent message to display reasoning steps
  const latestAgentMsg = [...chatHistory].reverse().find(m => m.sender === 'agent');

  // Hardcoded latencies for visual steps tracking
  const stepLatencies = ['42ms', '118ms', '204ms', '75ms', '92ms'];

  return (
    <div className="app-shell">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="brand-title">CampusVerse</h1>
            <p className="brand-subtitle">AI Campus OS</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-nav-group-label">Workspace</p>
          <button
            onClick={goToConsole}
            className={`sidebar-nav-item ${isConsoleActive ? 'active' : ''}`}
          >
            <Activity className="w-4 h-4" />
            <span>Agent Console</span>
          </button>
          <button
            onClick={() => setView('analytics')}
            className={`sidebar-nav-item ${view === 'analytics' ? 'active active-analytics' : ''}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analytics Insights</span>
          </button>

          <p className="sidebar-nav-group-label">Campus</p>
          {campusTabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => goToTab(tab.id)}
                className={`sidebar-nav-item ${isTabActive(tab.id) ? 'active' : ''}`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <a href="/admin" className="sidebar-nav-item" title="Staff-only console for office admins and faculty">
            <Shield className="w-4 h-4" />
            <span>Staff Console</span>
          </a>
        </div>
      </aside>

      {/* Right column: top bar + main content */}
      <div className="main-column">
        <header className="topbar">
          <div className="topbar-search">
            <Search className="w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campus, events, clubs..."
              className="topbar-search-input"
            />
          </div>
          <div className="topbar-actions">
            <span className={`ai-status-pill ${loading ? 'processing' : ''}`}>
              <span className="ai-status-dot" />
              {loading ? 'Processing' : 'AI Ready'}
            </span>
            <VoiceInputButton />
            <ThemeToggle />
            <div className="profile-chip">
              <div className="profile-chip-avatar">AS</div>
              <div>
                <p className="profile-chip-name">{student?.name || 'Student'}</p>
                <p className="profile-chip-role">{student?.department ? `${student.department} Student` : 'Student'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="main-content">
          {view === 'analytics' && <AnalyticsPanel />}

          {view === 'dashboard' && isConsoleActive && (
            <div className="console-layout">
            {/* Agent Mesh + Reasoning aside */}
            <div className="console-aside">
              {/* Agent Mesh Web */}
              <AgentCollaborationWeb 
                collaborations={latestAgentMsg?.agentCollaborations || []} 
                activeAgent={activeAgent} 
              />

              {/* Reasoning timeline */}
              {latestAgentMsg?.reasoningSteps && latestAgentMsg.reasoningSteps.length > 0 && (
                <div className="reasoning-card">
                  <h4 className="reasoning-header">
                    <Terminal className="w-3.5 h-3.5 text-cyan" />
                    <span>CENTRAL PLANNER REASONING STEPS</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {latestAgentMsg.reasoningSteps.map((step, idx) => (
                      <div key={idx} className="reasoning-step">
                        <span className="reasoning-step-num">{idx + 1}</span>
                        <div className="reasoning-step-body">
                          <div className="reasoning-step-header">
                            <p className="reasoning-step-title">{step.title}</p>
                            <span className="reasoning-step-duration">
                              Done · {stepLatencies[idx % stepLatencies.length]}
                            </span>
                          </div>
                          <p className="reasoning-step-detail">{step.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Terminal — the console's main column */}
            <div className="console-main">
              <div className="glass-panel chat-terminal">
                <div className="chat-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Terminal className="w-4 h-4 text-cyan" />
                    <span className="font-mono text-cyan" style={{ fontSize: '10.5px', fontWeight: 'bold' }}>Terminal Shell: aarav.sharma@campus.os</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ display: 'inline-block', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }}></span>
                </div>

                {/* Messages list */}
                <div className="chat-messages">
                  {chatHistory.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`chat-row ${msg.sender === 'user' ? 'user' : 'agent'}`}
                    >
                      {/* Avatar */}
                      <div className={`chat-avatar ${msg.sender === 'user' ? 'user' : 'agent'}`}>
                        {msg.sender === 'user' ? 'AS' : <Sparkles className="w-4 h-4" />}
                      </div>

                      {/* Bubble content */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div className="chat-bubble">
                          <div className="chat-meta">
                            <span>{msg.sender === 'user' ? 'Student: Aarav' : 'Central Planner Agent'}</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <p style={{ fontSize: '11.5px', color: '#e2e8f0' }}>{renderMarkdown(msg.text)}</p>
                        </div>

                        {/* AI Action Center Cards */}
                        {msg.sender === 'agent' && msg.intent && (
                          <div className="action-cards-container">
                            {msg.intent === 'JOIN_CLUB' && (
                              <>
                                <a href={msg.data?.whatsappGroup} target="_blank" rel="noreferrer" className="action-card-btn whatsapp">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Join WhatsApp</span>
                                </a>
                                <button onClick={() => sendChatMessage("Navigate to Programming Lab from Main Gate")} className="action-card-btn navigate">
                                  <Compass className="w-3.5 h-3.5" />
                                  <span>Navigate to Club</span>
                                </button>
                                <button onClick={() => alert("Calendar reminder generated successfully!")} className="action-card-btn reminder">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Add Reminder</span>
                                </button>
                              </>
                            )}
                            {msg.intent === 'EXAM_PREP' && (
                              <>
                                <button onClick={() => alert("7-day study guide exported to dashboard calendar!")} className="action-card-btn navigate">
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Export Schedule</span>
                                </button>
                                <button onClick={() => sendChatMessage("Navigate to Programming Lab from Main Gate")} className="action-card-btn reminder">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>Open Lab Route</span>
                                </button>
                                <button onClick={() => alert("Alert email dispatched to Dr. Ramesh Kumar")} className="action-card-btn navigate">
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>Contact Professor</span>
                                </button>
                              </>
                            )}
                            {msg.intent === 'PLACEMENT_PREP' && (
                              <>
                                <button onClick={() => alert("Successfully registered for Google placement drive!")} className="action-card-btn apply">
                                  <Award className="w-3.5 h-3.5" />
                                  <span>Register Drive</span>
                                </button>
                                <button onClick={() => alert("DSA practice tracker downloaded!")} className="action-card-btn navigate">
                                  <Download className="w-3.5 h-3.5" />
                                  <span>DSA Checksheet</span>
                                </button>
                              </>
                            )}
                            {msg.intent === 'NAVIGATION' && (
                              <>
                                <button onClick={() => alert("Amenities toggles applied!")} className="action-card-btn navigate">
                                  <Info className="w-3.5 h-3.5" />
                                  <span>Zoom Route</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="chat-row agent">
                      <div className="chat-avatar agent">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="typing-bubble">
                        <div className="typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span className="font-mono text-cyan" style={{ fontSize: '10px' }}>Planner Agent executing pipeline...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick actions chips row */}
                <div className="quick-actions-scroll">
                  {quickActions.map((action, idx) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => sendChatMessage(action.query)}
                        className="quick-action-btn"
                      >
                        <ActionIcon />
                        <span>{action.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Input form */}
                <form onSubmit={handleSubmit} className="chat-input-form">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message central campus planner (e.g. 'Join AI Club', 'DBMS exam next week')..."
                    className="chat-input-field"
                  />
                  <VoiceInputButton />
                  <button type="submit" className="chat-send-btn">
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </form>
              </div>
            </div>
            </div>
          )}

          {view === 'dashboard' && !isConsoleActive && (
            <div className="tabs-view">
              {/* Dynamic Action Widget Card at top */}
              {activeWidget && (
                <div className="animate-fade-in">
                  {activeWidget.intent === 'JOIN_CLUB' && <AIClubWidget data={activeWidget.data} />}
                  {activeWidget.intent === 'CAMPUS_UPDATES' && <DailyDigestWidget data={activeWidget.data} />}
                  {activeWidget.intent === 'EXAM_PREP' && <StudyPlanWidget data={activeWidget.data} />}
                  {activeWidget.intent === 'PLACEMENT_PREP' && <PlacementRoadmapWidget data={activeWidget.data} />}
                  {activeWidget.intent === 'HACKATHON_DISCOVERY' && <HackathonWidget data={activeWidget.data} />}
                  {activeWidget.intent === 'NAVIGATION' && <CampusMapWidget data={activeWidget.data} />}
                </div>
              )}

              {/* Student Operating System Panel — nav now lives in the sidebar */}
              <div className="glass-panel student-os-card">
                <div className="tab-content">
                  {activeDashboardTab === 'profile' && student && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* Student Profile Info */}
                      <div className="profile-section">
                        <div className="profile-gradient-bg"></div>
                        <div className="profile-avatar-initials">AS</div>
                        <div>
                          <h4 className="profile-name">{student.name}</h4>
                          <p className="profile-email">{student.email}</p>
                          <span className="profile-dept-badge">
                            {student.department} | Year {student.year}
                          </span>
                        </div>
                      </div>

                      {/* Profile Grid */}
                      <div className="info-grid">
                        <div className="info-card">
                          <p className="info-card-label">Eligible CGPA</p>
                          <p className="info-card-value text-cyan">{student.cgpa} / 10.0</p>
                        </div>
                        <div className="info-card">
                          <p className="info-card-label">Active Skills</p>
                          <p className="info-card-value" style={{ fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.skills}</p>
                        </div>
                      </div>

                      {/* Registered Societies */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h4 className="font-mono text-muted" style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.05em' }}>REGISTERED SOCIETIES</h4>
                        <div className="info-grid">
                          {dashboard.joinedClubs.map((club, idx) => (
                            <div key={idx} className="info-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '11.5px' }}>{club.name}</p>
                                <p className="text-muted" style={{ fontSize: '9px' }}>{club.category}</p>
                              </div>
                              <span className="w-2 h-2" style={{ display: 'inline-block', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }}></span>
                            </div>
                          ))}
                          {dashboard.joinedClubs.length === 0 && (
                            <p className="text-muted" style={{ gridColumn: 'span 2', textAlign: 'center', fontStyle: 'italic', fontSize: '11px', padding: '1rem 0' }}>No active registrations. Use chat to register.</p>
                          )}
                        </div>
                      </div>

                      {/* AI Recommendations */}
                      {recommendations && (
                        <div className="recs-section">
                          <h4 className="recs-header">
                            <Sparkles className="w-3.5 h-3.5 text-cyan" />
                            <span>PROACTIVE OS RECOMMENDATIONS</span>
                          </h4>
                          <div className="recs-grid">
                            <div className="recs-card">
                              <p className="recs-card-label">Clubs for Aarav</p>
                              {recommendations.clubs?.map((c, i) => (
                                <div key={i} className="recs-card-item">
                                  <span className="recs-card-name">{c.name}</span>
                                  <button 
                                    onClick={() => sendChatMessage(`Join me to the ${c.name}`)} 
                                    className="recs-action-btn"
                                  >
                                    Join
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="recs-card">
                              <p className="recs-card-label">Academic Mentors</p>
                              {recommendations.mentors?.map((m, i) => (
                                <div key={i} className="recs-card-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.1rem' }}>
                                  <p className="recs-card-name" style={{ fontWeight: 'bold' }}>{m.name}</p>
                                  <p className="text-muted" style={{ fontSize: '8px' }}>{m.matchReason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeDashboardTab === 'schedule' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h4 className="font-mono text-muted" style={{ fontSize: '10px', fontWeight: 'bold' }}>SCHEDULE AND ALERTS</h4>
                      {dashboard.activeReminders.map((rem, idx) => (
                        <div key={idx} className="info-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', borderColor: 'rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.02)' }}>
                          <Calendar className="w-5 h-5 text-amber" style={{ color: '#fbbf24' }} />
                          <div>
                            <p className="text-amber font-mono" style={{ fontSize: '8.5px', fontWeight: 'bold', letterSpacing: '0.05em' }}>AUTOMATED AGENT TASK</p>
                            <p style={{ fontSize: '11px', color: '#f1f5f9', marginTop: '0.15rem' }}>{rem}</p>
                          </div>
                        </div>
                      ))}
                      {dashboard.activeReminders.length === 0 && (
                        <p className="text-muted" style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '11px', padding: '2rem 0' }}>No active schedule logs. Trigger a study guide scenario to populate calendar.</p>
                      )}
                    </div>
                  )}

                  {activeDashboardTab === 'academic' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h4 className="font-mono text-muted" style={{ fontSize: '10px', fontWeight: 'bold' }}>ACTIVE CODES STUDY CALENDAR</h4>
                      {dashboard.activePlans.map((plan, idx) => (
                        <div key={idx} className="info-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.45rem' }}>
                            <div>
                              <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '13px' }}>{plan.subject} Study Plan</p>
                              <p className="text-muted" style={{ fontSize: '8px', fontFamily: 'var(--font-mono)' }}>GENERATED ACADEMIC CALENDAR</p>
                            </div>
                            <span className="font-mono text-amber" style={{ fontSize: '9px', fontWeight: 'bold', background: 'rgba(245,158,11,0.08)', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.15)' }}>
                              Exam: {new Date(plan.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {plan.tasks.map((task, i) => (
                              <div key={i} className="recs-card-item" style={{ padding: '0.55rem' }}>
                                <span className="recs-card-name">Day {task.day || i+1}: {task.topic || task}</span>
                                <span className="font-mono text-cyan" style={{ fontSize: '9px', fontWeight: 'bold', background: 'rgba(34, 211, 238,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                                  {task.hours || 3}h
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {dashboard.activePlans.length === 0 && (
                        <p className="text-muted" style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '11px', padding: '2rem 0' }}>No active exam planners.</p>
                      )}
                    </div>
                  )}

                  {activeDashboardTab === 'placement' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h4 className="font-mono text-muted" style={{ fontSize: '10px', fontWeight: 'bold' }}>PLACEMENT INTELLIGENCE</h4>
                      {recommendations?.projects && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          {recommendations.projects.map((proj, idx) => (
                            <div key={idx} className="info-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '11.5px' }}>{proj.title}</p>
                              <p className="text-muted" style={{ fontSize: '10px', lineClamp: 2 }}>{proj.description}</p>
                              <div style={{ alignSelf: 'flex-start', fontStyle: 'normal' }}>
                                <span className="font-mono text-cyan" style={{ fontSize: '8px', background: 'rgba(34, 211, 238,0.05)', border: '1px solid rgba(34, 211, 238,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                                  {proj.techStack}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeDashboardTab === 'map' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h4 className="font-mono text-muted" style={{ fontSize: '10px', fontWeight: 'bold' }}>MAP AND NAVIGATION SYSTEM</h4>
                      <div className="info-card" style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', alignItems: 'center' }}>
                        <Compass className="w-10 h-10 text-cyan animate-pulse" />
                        <p className="text-muted leading-relaxed" style={{ fontSize: '11px', maxWidth: '280px' }}>
                          Type <code className="font-mono text-cyan" style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 5px', borderRadius: '4px' }}>Navigate to Programming Lab</code> in the chat terminal to draw route maps.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeDashboardTab === 'community' && <CommunityFeedTab />}

                  {activeDashboardTab === 'campus' && <CampusResourcesTab />}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CampusProvider>
      <AppContent />
    </CampusProvider>
  );
}
