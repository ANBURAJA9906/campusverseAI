// Community Agent
// Manages club detail lookup, 1-click student registration, WhatsApp group links, and similar club recommendations.

import { createReminder, recordMemory } from './notificationAgent.js';

export async function processJoinClub(studentId, clubName, prisma) {
  // Find club in DB
  const club = await prisma.club.findFirst({
    where: {
      name: {
        contains: clubName
      }
    }
  });

  if (!club) {
    throw new Error(`Club "${clubName}" not found in database.`);
  }

  // Check if student is already registered
  const existingRegistration = await prisma.registration.findFirst({
    where: {
      studentId,
      clubId: club.id
    }
  });

  let registrationRecord;
  if (!existingRegistration) {
    registrationRecord = await prisma.registration.create({
      data: {
        studentId,
        clubId: club.id,
        date: new Date().toISOString()
      }
    });

    // Write to memory to remember this registration
    await recordMemory(studentId, {
      key: `joined_club_${club.name.toLowerCase().replace(' ', '_')}`,
      value: `Active member of ${club.name} as of ${new Date().toLocaleDateString()}`,
      category: 'preference'
    }, prisma);

    // Add a schedule reminder for club orientation
    const orientation = await prisma.event.findFirst({
      where: {
        type: 'orientation',
        name: {
          contains: club.name
        }
      }
    });

    if (orientation) {
      await prisma.registration.create({
        data: {
          studentId,
          eventId: orientation.id,
          date: new Date().toISOString()
        }
      });

      // Actual reminder record via the Notification Agent — this is what
      // the "Orientation reminder added to calendar" reasoning step
      // downstream refers to; previously that was just claimed in the UI
      // text without a real Memory record backing it.
      await createReminder(studentId, {
        key: `orientation_reminder_${club.name.toLowerCase().replace(' ', '_')}`,
        value: `${club.name} orientation: ${new Date(orientation.date).toLocaleDateString()} at ${orientation.location}.`
      }, prisma);
    }
  } else {
    registrationRecord = existingRegistration;
  }

  // Get Faculty & Student Coordinators from simulated community records
  let facultyCoordinator = 'Dr. Anita Sen (Dept of CSE)';
  let studentCoordinator = 'Rohan Dev (4th Year CSE)';
  if (club.name.toLowerCase().includes('coding')) {
    facultyCoordinator = 'Dr. Manoj Mishra (Dept of CSE)';
    studentCoordinator = 'Neha Kapoor (4th Year CSE)';
  } else if (club.name.toLowerCase().includes('web')) {
    facultyCoordinator = 'Prof. Sarah Thomas (Dept of IT)';
    studentCoordinator = 'Vikram Malhotra (4th Year CSE)';
  }

  // Find upcoming club events
  const clubEvents = await prisma.event.findMany({
    where: {
      description: {
        contains: club.name
      }
    }
  });

  // Recommends similar clubs
  const allClubs = await prisma.club.findMany();
  const similarClubs = allClubs
    .filter(c => c.id !== club.id)
    .map(c => ({
      name: c.name,
      category: c.category,
      description: c.description
    }));

  return {
    success: true,
    clubName: club.name,
    clubDescription: club.description,
    whatsappGroup: club.whatsappGroup,
    facultyCoordinator,
    studentCoordinator,
    upcomingEvents: clubEvents.map(e => ({
      name: e.name,
      date: new Date(e.date).toLocaleDateString(),
      location: e.location
    })),
    similarClubs,
    registrationId: registrationRecord.id
  };
}
