import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data (children before parents that they reference)
  await prisma.communityComment.deleteMany({});
  await prisma.communityPost.deleteMany({});
  await prisma.relation.deleteMany({});
  await prisma.entity.deleteMany({});
  await prisma.memory.deleteMany({});
  await prisma.studyPlan.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.club.deleteMany({});
  await prisma.hostel.deleteMany({});
  await prisma.libraryBook.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.staff.deleteMany({});

  // 1b. Create Staff / Admin accounts (Office Admin + Faculty)
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const facultyPasswordHash = await bcrypt.hash('Faculty@123', 10);

  const officeAdmin = await prisma.staff.create({
    data: {
      name: 'Office Administrator',
      email: 'admin@campusverse.edu',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      department: 'Dean of Student Affairs'
    }
  });

  const facultyMember = await prisma.staff.create({
    data: {
      name: 'Dr. Anita Sen',
      email: 'anita.sen@campusverse.edu',
      passwordHash: facultyPasswordHash,
      role: 'FACULTY',
      department: 'Computer Science & Engineering'
    }
  });

  console.log('Created staff accounts:', officeAdmin.email, '/', facultyMember.email);
  console.log('  Default login -> admin@campusverse.edu : Admin@123 (CHANGE THIS AFTER FIRST LOGIN)');

  // 2. Create Student
  const student = await prisma.student.create({
    data: {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@campus.edu',
      department: 'Computer Science & Engineering',
      year: 3,
      cgpa: 8.9,
      interests: 'AI, Machine Learning, Web Development, DSA, Placements',
      skills: 'JavaScript, React, Python, HTML/CSS',
    },
  });

  console.log('Created student:', student.name);

  // 3. Create Memories
  await prisma.memory.createMany({
    data: [
      { studentId: student.id, key: 'learning_style', value: 'Visual & Project-based learning', category: 'preference' },
      { studentId: student.id, key: 'placement_target', value: 'Software Engineer - Google / Microsoft', category: 'goal' },
      { studentId: student.id, key: 'preferred_programming_languages', value: 'JavaScript, Python', category: 'preference' },
      { studentId: student.id, key: 'career_path', value: 'AI Engineer / Full-Stack Developer', category: 'goal' }
    ]
  });

  // 4. Create Clubs
  const aiClub = await prisma.club.create({
    data: {
      name: 'AI Club',
      description: 'Campus AI Club focusing on Neural Networks, Large Language Models, Computer Vision, and AI Agents.',
      category: 'Technical',
      whatsappGroup: 'https://chat.whatsapp.com/G5k3mN8dF9L8XyZb',
      createdById: officeAdmin.id,
    },
  });

  const codingClub = await prisma.club.create({
    data: {
      name: 'Coding Club',
      description: 'The premier competitive coding and data structures club preparing students for coding contests and SDE interviews.',
      category: 'Technical',
      whatsappGroup: 'https://chat.whatsapp.com/C3k8mP9dF8L2XyZa',
      createdById: officeAdmin.id,
    },
  });

  const webDevClub = await prisma.club.create({
    data: {
      name: 'WebDev Club',
      description: 'A community of web creators developing modern full-stack web applications and collaborating on open source projects.',
      category: 'Technical',
      whatsappGroup: 'https://chat.whatsapp.com/W2m7jK8dG9B5XyCc',
      createdById: officeAdmin.id,
    },
  });

  console.log('Created clubs');

  // 5. Create Events
  const events = await prisma.event.createMany({
    data: [
      {
        name: 'Google AI Hackathon',
        description: 'Design and build innovative AI solutions using Gemini API. Participate in teams of 2 to 4.',
        date: '2026-07-18T10:00:00Z', // Today
        type: 'hackathon',
        deadline: '2026-07-18T23:59:00Z',
        location: 'Seminar Hall 1, CSE Block',
        createdById: officeAdmin.id,
      },
      {
        name: 'Smart Campus Hackathon',
        description: 'Build smart solutions for student life, energy efficiency, or routing systems in our university.',
        date: '2026-07-19T09:00:00Z', // Tomorrow
        type: 'hackathon',
        deadline: '2026-07-18T22:00:00Z',
        location: 'Main Library Lab A',
        createdById: officeAdmin.id,
      },
      {
        name: 'AI Club Orientation & Agent Showcase',
        description: 'Welcome orientation for new members. We will demonstrate active agent workflows and announce team selections.',
        date: '2026-07-20T14:30:00Z',
        type: 'orientation',
        deadline: '2026-07-19T18:00:00Z',
        location: 'Programming Lab, Block B Room 302',
        createdById: officeAdmin.id,
      },
      {
        name: 'Google SDE Placement Drive',
        description: 'On-campus recruitment drive for 2027 graduates. Software Engineer (SDE) position.',
        date: '2026-08-10T09:00:00Z',
        type: 'placement_drive',
        deadline: '2026-08-01T17:00:00Z',
        location: 'Placement Cell Auditorium',
        createdById: officeAdmin.id,
      },
      {
        name: 'Microsoft Internship Drive',
        description: 'Summer internships for pre-final year students. Roles in Software Engineering and Data Science.',
        date: '2026-08-15T10:00:00Z',
        type: 'placement_drive',
        deadline: '2026-08-05T23:59:00Z',
        location: 'CSE Department Seminar Room',
        createdById: officeAdmin.id,
      }
    ]
  });

  console.log('Created events');

  // 5b. Create Hostels (Smart Hostel Information)
  await prisma.hostel.createMany({
    data: [
      {
        name: 'Vindhya Hostel (Boys)',
        type: 'Boys',
        warden: 'Mr. Suresh Patil',
        contact: '+91 98765 43210',
        messTimings: 'Breakfast 7:30-9:30 AM, Lunch 12:30-2:30 PM, Dinner 7:30-9:30 PM',
        facilities: 'WiFi, Laundry, Gym, 24x7 Water Supply, Common TV Room',
        location: 'North Campus, Near Main Gate',
        createdById: officeAdmin.id,
      },
      {
        name: 'Godavari Hostel (Girls)',
        type: 'Girls',
        warden: 'Mrs. Kavita Reddy',
        contact: '+91 98765 12345',
        messTimings: 'Breakfast 7:30-9:30 AM, Lunch 12:30-2:30 PM, Dinner 7:30-9:30 PM',
        facilities: 'WiFi, Laundry, Study Room, CCTV Security, Indoor Games Room',
        location: 'South Campus, Near Library',
        createdById: officeAdmin.id,
      }
    ]
  });

  console.log('Created hostels');

  // 5c. Create Library Books (Smart Library Information)
  await prisma.libraryBook.createMany({
    data: [
      {
        title: 'Database System Concepts',
        author: 'Silberschatz, Korth, Sudarshan',
        category: 'Textbook',
        callNumber: 'QA76.9.D3 S56 2020',
        totalCopies: 5,
        availableCopies: 3,
        createdById: officeAdmin.id,
      },
      {
        title: 'Fundamentals of Database Systems',
        author: 'Elmasri, Navathe',
        category: 'Textbook',
        callNumber: 'QA76.9.D3 E43 2017',
        totalCopies: 4,
        availableCopies: 1,
        createdById: officeAdmin.id,
      },
      {
        title: 'Introduction to Algorithms',
        author: 'Cormen, Leiserson, Rivest, Stein',
        category: 'Reference',
        callNumber: 'QA76.6.C662 2009',
        totalCopies: 6,
        availableCopies: 4,
        createdById: officeAdmin.id,
      }
    ]
  });

  console.log('Created library books');

  // 6. Create Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: 'DBMS Midterm Exam Schedule Announced',
        content: 'The Database Management Systems (DBMS) midterm exam for 3rd Year CSE is scheduled for Next Monday, July 27, 2026, at 10:00 AM in Exam Hall B. The exam will cover SQL, Normalization, and Indexing. Please carry your University ID card.',
        date: '2026-07-18T08:00:00Z',
        category: 'exam',
        summarized: 'DBMS Exam next Monday, July 27th, 10:00 AM at Exam Hall B. Covers SQL, Normalization, Indexing. Bring IDs.',
        createdById: officeAdmin.id
      },
      {
        title: 'Google SDE Placement Registrations Open',
        content: 'Registration for the Google SDE Placement Drive is now active. All 3rd and 4th-year students with a CGPA above 7.5 are eligible. Ensure your profile contains accurate skills in C++, Python, or Java and any completed web projects. Apply on the placement portal by August 1st.',
        date: '2026-07-17T09:30:00Z',
        category: 'placement',
        summarized: 'Google Placement registrations are open. Criteria: 3rd/4th year, CGPA > 7.5. Deadline: August 1st.',
        createdById: officeAdmin.id
      },
      {
        title: 'AI Club Recruitment Hackathon Registration Closing',
        content: 'Registration for the AI Club recruitment hackathon (Google AI Hackathon) closes tonight at 11:59 PM. Teams must register on the platform. Top 5 teams will gain direct entry into the AI Core Research Group and receive mentoring on generative AI.',
        date: '2026-07-18T06:00:00Z',
        category: 'general',
        summarized: 'Google AI Hackathon registration closes tonight at 11:59 PM. Top 5 teams get direct AI Club core entry.',
        createdById: officeAdmin.id
      }
    ]
  });

  console.log('Created announcements');

  // 6b. Create Community Posts (AI Senior Mentor Community)
  const communityPost = await prisma.communityPost.create({
    data: {
      studentId: student.id,
      title: 'How did seniors prepare for the Google SDE placement drive?',
      content: "I'm a 3rd year CSE student starting DSA prep for the upcoming Google drive. Would love to hear what topics seniors focused on most and any resources that actually helped.",
      tags: 'Placements, DSA, Google'
    }
  });

  await prisma.communityComment.create({
    data: {
      postId: communityPost.id,
      studentId: student.id,
      content: 'Focus heavily on Trees, Graphs, and DP — that\'s what came up most in my interview loop last year.'
    }
  });

  console.log('Created community posts');

  // 7. Create Knowledge Graph Entities
  const entities = [
    { name: 'Aarav Sharma', type: 'Student', description: '3rd Year Computer Science student interested in AI and Full-Stack development.' },
    { name: 'Dr. Ramesh Kumar', type: 'Faculty', description: 'DBMS Professor and specialist in distributed database systems.' },
    { name: 'Dr. Anita Sen', type: 'Faculty', description: 'AI/ML Professor and advisor to the Campus AI Club.' },
    { name: 'Programming Lab', type: 'Lab', description: 'CSE Block B, Room 302. Equipped with GPUs and high-speed network.' },
    { name: 'DBMS', type: 'Subject', description: 'Database Management Systems core curriculum covering SQL, transactions, and indexing.' },
    { name: 'AI Club', type: 'Club', description: 'Student-led artificial intelligence and machine learning club.' },
    { name: 'Coding Club', type: 'Club', description: 'Competitive programming and DSA enthusiast circle.' },
    { name: 'Google Placement Drive', type: 'Event', description: 'Placement drive hosted by Google for SWE roles.' },
    { name: 'Computer Science Department', type: 'Department', description: 'CSE department offering undergraduate and research programs.' }
  ];

  const dbEntities = [];
  for (const ent of entities) {
    const dbEnt = await prisma.entity.create({
      data: ent
    });
    dbEntities.push(dbEnt);
  }

  console.log('Created KG entities');

  // Helper to find entity ID by name
  const findId = (name) => dbEntities.find(e => e.name === name)?.id || '';

  // 8. Create Knowledge Graph Relations
  await prisma.relation.createMany({
    data: [
      { sourceId: findId('Aarav Sharma'), targetId: findId('Computer Science Department'), type: 'BELONGS_TO' },
      { sourceId: findId('Aarav Sharma'), targetId: findId('Coding Club'), type: 'MEMBER_OF' },
      { sourceId: findId('Dr. Ramesh Kumar'), targetId: findId('DBMS'), type: 'TEACHES' },
      { sourceId: findId('Dr. Ramesh Kumar'), targetId: findId('Computer Science Department'), type: 'MEMBER_OF' },
      { sourceId: findId('Dr. Anita Sen'), targetId: findId('AI Club'), type: 'MENTORS' },
      { sourceId: findId('Dr. Anita Sen'), targetId: findId('Computer Science Department'), type: 'MEMBER_OF' },
      { sourceId: findId('DBMS'), targetId: findId('Programming Lab'), type: 'REQUIRES_LAB' },
      { sourceId: findId('Programming Lab'), targetId: findId('Computer Science Department'), type: 'LOCATED_IN' },
      { sourceId: findId('AI Club'), targetId: findId('Programming Lab'), type: 'MEETS_IN' },
      { sourceId: findId('Google Placement Drive'), targetId: findId('Computer Science Department'), type: 'RECRUITS_FROM' }
    ]
  });

  console.log('Created KG relations');
  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
