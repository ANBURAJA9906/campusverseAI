// Personalized Recommendation Engine
// Combines student profile, memory, registered clubs, skills, and knowledge graph relations.

export async function getRecommendations(studentId, prisma) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { registrations: true, memories: true }
  });

  if (!student) return null;

  const interests = student.interests.split(', ').map(i => i.toLowerCase());
  const skills = student.skills.split(', ').map(s => s.toLowerCase());

  // 1. Recommend Clubs
  const allClubs = await prisma.club.findMany();
  const joinedClubIds = student.registrations.map(r => r.clubId).filter(Boolean);
  
  const recommendedClubs = allClubs
    .filter(c => !joinedClubIds.includes(c.id))
    .map(c => {
      // Calculate score based on category and description match
      let score = 0;
      if (interests.some(interest => c.name.toLowerCase().includes(interest) || c.description.toLowerCase().includes(interest))) {
        score += 50;
      }
      if (c.category === 'Technical' && (interests.includes('ai') || interests.includes('web development') || interests.includes('dsa'))) {
        score += 30;
      }
      return { club: c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(item => item.club);

  // 2. Recommend Hackathons
  const allEvents = await prisma.event.findMany({ where: { type: 'hackathon' } });
  const joinedEventIds = student.registrations.map(r => r.eventId).filter(Boolean);

  const recommendedEvents = allEvents
    .filter(e => !joinedEventIds.includes(e.id))
    .map(e => {
      let score = 0;
      if (interests.some(interest => e.name.toLowerCase().includes(interest) || e.description.toLowerCase().includes(interest))) {
        score += 40;
      }
      if (skills.some(skill => e.description.toLowerCase().includes(skill))) {
        score += 30;
      }
      return { event: e, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(item => item.event);

  // 3. Recommend Faculty Mentors (utilizing KG relations)
  // Find Faculty who mentors AI Club or teaches related subjects
  const faculties = await prisma.entity.findMany({ where: { type: 'Faculty' } });
  
  const recommendedMentors = [];
  for (const fac of faculties) {
    // Find relations connected to this Faculty
    const relations = await prisma.relation.findMany({
      where: { sourceId: fac.id }
    });

    let score = 0;
    const details = [];

    for (const rel of relations) {
      const target = await prisma.entity.findUnique({ where: { id: rel.targetId } });
      if (!target) continue;

      if (rel.type === 'MENTORS' && target.type === 'Club') {
        details.push(`Mentors ${target.name}`);
        if (interests.some(i => target.name.toLowerCase().includes(i))) {
          score += 40;
        }
      }
      if (rel.type === 'TEACHES' && target.type === 'Subject') {
        details.push(`Teaches ${target.name}`);
        if (interests.some(i => target.name.toLowerCase().includes(i))) {
          score += 30;
        }
      }
    }

    recommendedMentors.push({
      name: fac.name,
      description: fac.description,
      matchReason: details.join(', ') || 'CSE Department Advisor',
      score
    });
  }

  // Sort mentors
  const sortedMentors = recommendedMentors.sort((a, b) => b.score - a.score).slice(0, 2);

  // 4. Recommend Projects based on skills
  const recommendedProjects = [
    {
      title: 'AI-Powered Resume Screen & SDE Assessor',
      techStack: 'React, Node, SQLite, Gemini API',
      description: 'An intelligent portal that ranks student resumes against SDE placement listings using the campus knowledge graph.'
    },
    {
      title: 'Real-time Campus Traffic & Lab Router',
      techStack: 'Python, Flask, React, SVG Mapping',
      description: 'Finds optimal walking paths on campus during class changes and visualizes crowd density.'
    }
  ];

  return {
    clubs: recommendedClubs.map(c => ({ name: c.name, category: c.category, whatsappGroup: c.whatsappGroup })),
    hackathons: recommendedEvents.map(e => ({ name: e.name, date: new Date(e.date).toLocaleDateString(), deadline: e.deadline })),
    mentors: sortedMentors.map(m => ({ name: m.name, matchReason: m.matchReason })),
    projects: recommendedProjects
  };
}
