// Notification Agent
// Owns creation of Memory records — reminders (category "goal", surfaced on
// the student dashboard as activeReminders) and general memory/preference
// entries. Previously other agents (academicAgent, communityAgent) wrote
// directly to prisma.memory.create ad hoc; centralized here so the file
// structure matches the architecture diagram/pitch (NotificationAgent was
// presented as a real specialized agent, not just a label on a graph edge).

// Creates (or refreshes) a dashboard reminder for a student. `key` should be
// stable/unique per logical reminder (e.g. "exam_reminder_dbms") so calling
// this again for the same thing updates rather than duplicates it.
export async function createReminder(studentId, { key, value }, prisma) {
  const existing = await prisma.memory.findFirst({
    where: { studentId, key, category: 'goal' }
  });

  if (existing) {
    return prisma.memory.update({
      where: { id: existing.id },
      data: { value }
    });
  }

  return prisma.memory.create({
    data: { studentId, key, value, category: 'goal' }
  });
}

// General-purpose memory write for non-reminder facts (e.g. "student joined
// X club", stored as category "preference"). Kept separate from
// createReminder since these aren't surfaced as dashboard reminders.
export async function recordMemory(studentId, { key, value, category }, prisma) {
  return prisma.memory.create({
    data: { studentId, key, value, category }
  });
}
