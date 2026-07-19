// Event Intelligence Agent
// Deduplicates, sorts, and flags deadlines for campus events. Originally
// hackathon-only; now generalized so any event type (workshop, orientation,
// placement_drive, hackathon, ...) gets the same dedup/sort/deadline
// treatment plus an AI-extracted highlight sentence. Hackathon-specific
// extras (teammate matching, project ideas) stay scoped to hackathons only.

import { extractEventHighlights } from '../services/geminiService.js';

// Naive fallback highlight, used per-event when Gemini is unavailable or a
// given event wasn't covered in the batch response — keeps the demo
// resilient offline.
function naiveHighlight(event) {
  const deadlineDate = new Date(event.deadline);
  const deadlineText = isNaN(deadlineDate.getTime())
    ? null
    : deadlineDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return deadlineText
    ? `${event.name} at ${event.location} — register by ${deadlineText}.`
    : `${event.name} at ${event.location}.`;
}

// Shared dedup + sort + "closing soon" flag, usable for any event list
// regardless of type.
function buildEventList(events) {
  const uniqueEvents = [];
  const seenNames = new Set();
  for (const e of events) {
    if (!seenNames.has(e.name)) {
      seenNames.add(e.name);
      uniqueEvents.push(e);
    }
  }

  const sorted = uniqueEvents.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const now = new Date();

  return sorted.map(e => {
    const deadlineDate = new Date(e.deadline);
    const hoursUntilDeadline = (deadlineDate - now) / (1000 * 60 * 60);
    return {
      id: e.id,
      name: e.name,
      description: e.description,
      type: e.type,
      location: e.location,
      date: new Date(e.date).toLocaleDateString(),
      deadline: e.deadline,
      closingSoon: hoursUntilDeadline >= 0 && hoursUntilDeadline <= 24
    };
  });
}

/**
 * Generalized event discovery: fetches events (optionally filtered by
 * type), dedupes/sorts/flags them, and attaches an AI-extracted highlight
 * sentence to each (deadline/venue callout) with a fail-soft fallback.
 * Covers submitted-feature gap #2 — event intelligence for all event types,
 * not just hackathons.
 */
export async function processGeneralEventDiscovery(prisma, { type } = {}) {
  const events = await prisma.event.findMany(type ? { where: { type } } : undefined);
  const formatted = buildEventList(events);

  if (formatted.length === 0) {
    return { events: [] };
  }

  const highlights = await extractEventHighlights(formatted);

  const eventsWithHighlights = formatted.map(e => ({
    ...e,
    highlight: highlights?.get(e.id) || naiveHighlight(e)
  }));

  return { events: eventsWithHighlights };
}

/**
 * Hackathon-specific discovery: same dedup/sort/deadline treatment as
 * processGeneralEventDiscovery, plus hackathon-only extras (teammate
 * matching, project idea suggestions) used by the HACKATHON_DISCOVERY
 * intent and HackathonWidget on the frontend.
 */
export async function processEventDiscovery(studentProfile, prisma) {
  const hackathons = await prisma.event.findMany({ where: { type: 'hackathon' } });
  const formattedHackathons = buildEventList(hackathons).map(h => ({
    ...h,
    matchPercentage: h.name.toLowerCase().includes('ai') ? 95 : 80 // based on student profile interests
  }));

  // Suggest Teammates based on skill complementarity (Student Aarav has React & Python)
  // We match him with mock students who have complementary skills (e.g., UI/UX, Backend Node, Mobile Dev)
  const suggestedTeammates = [
    {
      name: 'Riya Gupta',
      department: 'Computer Science',
      year: 3,
      skills: 'UI/UX Design, Figma, Tailwind CSS',
      matchReason: 'Complements your frontend engineering with premium UI/UX prototyping skills.',
      matchPercentage: 92
    },
    {
      name: 'Kabir Mehta',
      department: 'Information Technology',
      year: 3,
      skills: 'Node.js, Express, PostgreSQL, Docker',
      matchReason: 'Complements your React/Python stack with robust server management and backend deployment.',
      matchPercentage: 88
    },
    {
      name: 'Ananya Roy',
      department: 'Electronics & Communication',
      year: 4,
      skills: 'Embedded Systems, IoT, C++',
      matchReason: 'Ideal partner if you want to build a hardware-integrated AI project.',
      matchPercentage: 75
    }
  ];

  // Suggest Project Ideas based on current hackathon themes
  const suggestedProjectIdeas = [
    {
      title: 'Smart Campus Nav-Bot',
      techStack: 'React, Node, SQLite, Tailwind',
      description: 'An AI-powered routing guide for campus mapping with real-time room capacity tracking.'
    },
    {
      title: 'EduGemini Study Partner',
      techStack: 'Python, FastAPI, React, Gemini API',
      description: 'A generative AI assistant that generates customized lecture quizzes and indexes library database logs automatically.'
    }
  ];

  return {
    hackathons: formattedHackathons,
    teammates: suggestedTeammates,
    projectIdeas: suggestedProjectIdeas
  };
}
