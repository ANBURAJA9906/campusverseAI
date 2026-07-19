// Placement Agent
// Generates personalized placement roadmaps, SDE DSA practice tracks, project suggestions, and lists placement drives.

import { createReminder } from './notificationAgent.js';

export async function processPlacement(studentProfile, prisma) {
  const department = studentProfile?.department || 'Computer Science';
  const year = studentProfile?.year || 3;
  const skills = studentProfile?.skills?.split(', ') || [];

  // Define custom SDE Roadmap based on year
  let roadmapSteps = [];
  if (year === 3) {
    roadmapSteps = [
      { step: 1, title: 'DSA Mastery & Core CS', detail: 'Complete 250+ questions on LeetCode/GeeksForGeeks focusing on Trees, Graphs, and DP.', period: 'July - September' },
      { step: 2, title: 'Build Resume-worthy Projects', detail: 'Build a Full-Stack Generative AI application integrating React, Node, or Python.', period: 'October - November' },
      { step: 3, title: 'System Design & OS/DBMS', detail: 'Study Low-Level Design (LLD), Object-Oriented Design, and review SQL/OS theory.', period: 'December - January' },
      { step: 4, title: 'Mock Interviews & Application', detail: 'Practice live mock interviews, refine resume, and apply to upcoming Google/Microsoft drives.', period: 'February onwards' }
    ];
  } else {
    roadmapSteps = [
      { step: 1, title: 'Immediate Mock Interviews', detail: 'Daily mock coding rounds and behavioral prep.', period: 'August' },
      { step: 2, title: 'Review Database & OS concepts', detail: 'Fast recap of indexing, transactions, threads, and paging.', period: 'September' }
    ];
  }

  // DSA Practice Plan
  const dsaPlan = [
    { topic: 'Arrays & Strings', targetCount: 40, completedCount: 32, priority: 'High' },
    { topic: 'HashMaps & HashSets', targetCount: 20, completedCount: 18, priority: 'High' },
    { topic: 'Recursion & Backtracking', targetCount: 25, completedCount: 10, priority: 'Medium' },
    { topic: 'Trees & Graphs', targetCount: 45, completedCount: 15, priority: 'Critical' },
    { topic: 'Dynamic Programming', targetCount: 30, completedCount: 5, priority: 'Critical' }
  ];

  // Projects based on skills
  const suggestedProjects = [
    {
      title: 'AI-Powered Interview Coach',
      difficulty: 'Hard',
      techStack: 'React, Python, FastAPI, Gemini API',
      description: 'A web app that simulates technical interviews, analyzes facial/textual responses, and provides detailed SQL/DSA coaching reviews.'
    },
    {
      title: 'Distributed Transaction Logger',
      difficulty: 'Medium',
      techStack: 'Node.js, Express, SQLite, Redis',
      description: 'Create a highly performant transaction logger verifying ACID compliance across multiple SQLite database nodes.'
    }
  ];

  // Certifications
  const recommendedCertifications = [
    { name: 'Google Cloud Associate Cloud Engineer', provider: 'Google Cloud', validity: '2 Years' },
    { name: 'AWS Certified Developer - Associate', provider: 'AWS', validity: '3 Years' }
  ];

  // Fetch placement drives from Event DB
  const drives = await prisma.event.findMany({
    where: {
      type: 'placement_drive'
    },
    orderBy: {
      date: 'asc'
    }
  });

  // Remind the student about the nearest upcoming drive via the
  // Notification Agent — backs the PlacementAgent -> NotificationAgent
  // collaboration shown in the agent graph, which previously had no real
  // logic behind it.
  if (drives.length > 0 && studentProfile?.id) {
    const nextDrive = drives[0];
    await createReminder(studentProfile.id, {
      key: 'next_placement_drive',
      value: `Placement drive reminder: ${nextDrive.name} on ${new Date(nextDrive.date).toLocaleDateString()} at ${nextDrive.location}. Registration deadline: ${nextDrive.deadline}.`
    }, prisma);
  }

  return {
    department,
    year,
    roadmapSteps,
    dsaPlan,
    suggestedProjects,
    recommendedCertifications,
    upcomingDrives: drives.map(d => ({
      name: d.name,
      date: new Date(d.date).toLocaleDateString(),
      location: d.location,
      deadline: d.deadline
    }))
  };
}
