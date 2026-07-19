// Academic Agent
// Generates personalized study plans, retrieves book recommendations, and prepares calendar schedules.

import { createReminder } from './notificationAgent.js';

// Default lead time (days) used when the student's message doesn't mention
// a specific exam date (e.g. "I have a DBMS exam next week") — keeps the
// 7-day study plan below meaningful without hardcoding a calendar date.
const DEFAULT_EXAM_LEAD_DAYS = 9;

function defaultExamDateISO(today) {
  const d = new Date(today);
  d.setDate(d.getDate() + DEFAULT_EXAM_LEAD_DAYS);
  return d.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

export async function processAcademic(studentId, subject, examDateString, prisma) {
  const today = new Date();
  const resolvedExamDateString = examDateString || defaultExamDateISO(today);
  const examDate = new Date(resolvedExamDateString);

  const diffTime = Math.abs(examDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Create daily study schedule tasks
  const tasks = [
    { day: 1, topic: 'Introduction to DBMS & Relational Model', hours: 2, status: 'pending' },
    { day: 2, topic: 'SQL Queries, Subqueries & Joins', hours: 3, status: 'pending' },
    { day: 3, topic: 'Entity-Relationship (ER) Diagrams', hours: 2, status: 'pending' },
    { day: 4, topic: 'Database Normalization (1NF, 2NF, 3NF, BCNF)', hours: 4, status: 'pending' },
    { day: 5, topic: 'Indexing, B-Trees & Hash Indexing', hours: 3, status: 'pending' },
    { day: 6, topic: 'Transactions (ACID Properties) & Concurrency Control', hours: 4, status: 'pending' },
    { day: 7, topic: 'Recovery Systems & Full Revision + Mock Test', hours: 4, status: 'pending' }
  ];

  const recommendedBooks = [
    { title: 'Database System Concepts', authors: 'Silberschatz, Korth, Sudarshan', callNumber: 'QA76.9.D3 S56 2020', status: 'Available (Library Stack 4)' },
    { title: 'Fundamentals of Database Systems', authors: 'Elmasri, Navathe', callNumber: 'QA76.9.D3 E43 2017', status: 'Borrowed (Due July 25)' }
  ];

  const onlineResources = [
    { title: 'Gate Smashers DBMS Playlist', channel: 'Gate Smashers', link: 'https://youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8m_p7gWY5E1c1F3LY', duration: '50 videos' },
    { title: 'DBMS Full Course for Beginners', channel: 'freeCodeCamp', link: 'https://youtube.com/watch?v=HXV3zeQKqGY', duration: '4.5 hours' }
  ];

  // Save the study plan to the database
  const existingPlan = await prisma.studyPlan.findFirst({
    where: { studentId, subject }
  });

  let studyPlanRecord;
  if (existingPlan) {
    studyPlanRecord = await prisma.studyPlan.update({
      where: { id: existingPlan.id },
      data: {
        date: resolvedExamDateString,
        tasks: JSON.stringify(tasks)
      }
    });
  } else {
    studyPlanRecord = await prisma.studyPlan.create({
      data: {
        studentId,
        subject,
        date: resolvedExamDateString,
        tasks: JSON.stringify(tasks)
      }
    });
  }

  // Create/refresh the exam reminder via the Notification Agent
  await createReminder(studentId, {
    key: `exam_reminder_${subject.toLowerCase()}`,
    value: `Exam reminder: ${subject} on ${resolvedExamDateString}. Review Study Plan on Dashboard.`
  }, prisma);

  return {
    subject,
    examDate: resolvedExamDateString,
    daysRemaining: diffDays,
    tasks,
    recommendedBooks,
    onlineResources,
    planId: studyPlanRecord.id
  };
}
