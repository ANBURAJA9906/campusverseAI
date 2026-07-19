// Campus Info Agent
// Assembles the Daily Campus Digest: official announcements (already
// Gemini-summarized at write time by the Admin/Faculty portal) plus a live,
// AI-highlighted view of every upcoming event across all types — hackathon,
// workshop, orientation, placement_drive, etc — via the Event Intelligence
// Agent. Previously this was inlined directly in plannerAgent.js under the
// CAMPUS_UPDATES branch; extracted here so the file structure matches the
// architecture diagram/pitch (CampusInfoAgent was presented as a real
// specialized agent).

import { processGeneralEventDiscovery } from './eventAgent.js';

export async function processCampusUpdates(prisma) {
  const announcements = await prisma.announcement.findMany({
    orderBy: { date: 'desc' }
  });

  // Delegates to the Event Intelligence Agent for the dedup/sort/highlight
  // work rather than duplicating that logic here.
  const { events: upcomingEvents } = await processGeneralEventDiscovery(prisma);

  return {
    announcements: announcements.map(a => ({
      title: a.title,
      content: a.content,
      summarized: a.summarized,
      category: a.category
    })),
    todayEvents: upcomingEvents.map(e => ({
      name: e.name,
      type: e.type,
      date: e.date,
      deadline: e.deadline,
      location: e.location,
      closingSoon: e.closingSoon,
      highlight: e.highlight
    })),
    announcementCount: announcements.length,
    eventCount: upcomingEvents.length
  };
}
