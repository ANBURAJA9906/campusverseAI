// Admin / Faculty Portal Routes
// Everything here requires a valid Staff JWT (requireStaff). This is the
// separate console office admins and faculty use to manage announcements,
// clubs, events, and view student registrations — distinct from the
// student-facing chat/dashboard flow.

import express from 'express';
import { requireStaff } from '../middleware/auth.js';
import { summarizeAnnouncement, generateWelcomePoster, isGeminiAvailable, getGeminiProviderInfo } from '../services/geminiService.js';

export function createAdminRouter(prisma) {
  const router = express.Router();

  // All admin routes require a logged-in staff member (ADMIN or FACULTY)
  router.use(requireStaff);

  // ---------- Overview ----------
  router.get('/overview', async (req, res) => {
    try {
      const [studentCount, clubCount, eventCount, announcementCount, registrationCount] = await Promise.all([
        prisma.student.count(),
        prisma.club.count(),
        prisma.event.count(),
        prisma.announcement.count(),
        prisma.registration.count()
      ]);

      res.json({
        loggedInAs: req.staff,
        stats: { studentCount, clubCount, eventCount, announcementCount, registrationCount },
        geminiEnabled: isGeminiAvailable(),
        geminiProvider: getGeminiProviderInfo() // { provider: 'studio'|'vertex', configured, project, location }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ---------- Students (read-only oversight) ----------
  router.get('/students', async (req, res) => {
    try {
      const students = await prisma.student.findMany({
        include: { registrations: true, studyPlans: true }
      });
      res.json(students.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        department: s.department,
        year: s.year,
        cgpa: s.cgpa,
        clubsJoined: s.registrations.filter(r => r.clubId).length,
        eventsRegistered: s.registrations.filter(r => r.eventId).length,
        activeStudyPlans: s.studyPlans.length
      })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ---------- Announcements ----------
  router.get('/announcements', async (req, res) => {
    try {
      const announcements = await prisma.announcement.findMany({
        orderBy: { date: 'desc' },
        include: { createdBy: { select: { name: true, role: true } } }
      });
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/announcements', async (req, res) => {
    try {
      const { title, content, category } = req.body;
      if (!title || !content || !category) {
        return res.status(400).json({ error: 'Title, content and category are required' });
      }

      const geminiSummary = await summarizeAnnouncement(title, content);
      let summarized;
      if (geminiSummary) {
        summarized = `ALERT: ${title}. ${geminiSummary}`;
      } else {
        const words = content.split(' ');
        summarized = `ALERT: ${title}. ${words.slice(0, 15).join(' ')}...`;
      }

      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          category,
          date: new Date().toISOString(),
          summarized,
          createdById: req.staff.id
        }
      });

      res.json({ success: true, announcement });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/announcements/:id', async (req, res) => {
    try {
      await prisma.announcement.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ---------- Clubs ----------
  router.post('/clubs', async (req, res) => {
    try {
      const { name, description, category, whatsappGroup } = req.body;
      if (!name || !description || !category || !whatsappGroup) {
        return res.status(400).json({ error: 'name, description, category and whatsappGroup are required' });
      }
      const club = await prisma.club.create({
        data: { name, description, category, whatsappGroup, createdById: req.staff.id }
      });
      res.json({ success: true, club });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/clubs/:id', async (req, res) => {
    try {
      const { name, description, category, whatsappGroup } = req.body;
      const club = await prisma.club.update({
        where: { id: req.params.id },
        data: { name, description, category, whatsappGroup }
      });
      res.json({ success: true, club });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/clubs/:id', async (req, res) => {
    try {
      await prisma.club.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ---------- Events ----------
  router.post('/events', async (req, res) => {
    try {
      const { name, description, date, type, deadline, location } = req.body;
      if (!name || !description || !date || !type || !deadline || !location) {
        return res.status(400).json({ error: 'name, description, date, type, deadline and location are required' });
      }
      const event = await prisma.event.create({
        data: { name, description, date, type, deadline, location, createdById: req.staff.id }
      });
      res.json({ success: true, event });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/events/:id', async (req, res) => {
    try {
      const { name, description, date, type, deadline, location } = req.body;
      const event = await prisma.event.update({
        where: { id: req.params.id },
        data: { name, description, date, type, deadline, location }
      });
      res.json({ success: true, event });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/events/:id', async (req, res) => {
    try {
      await prisma.event.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ---------- Hostels (Smart Hostel Information) ----------
  router.post('/hostels', async (req, res) => {
    try {
      const { name, type, warden, contact, messTimings, facilities, location } = req.body;
      if (!name || !type || !warden || !contact || !messTimings || !facilities || !location) {
        return res.status(400).json({ error: 'name, type, warden, contact, messTimings, facilities and location are required' });
      }
      const hostel = await prisma.hostel.create({
        data: { name, type, warden, contact, messTimings, facilities, location, createdById: req.staff.id }
      });
      res.json({ success: true, hostel });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/hostels/:id', async (req, res) => {
    try {
      const { name, type, warden, contact, messTimings, facilities, location } = req.body;
      const hostel = await prisma.hostel.update({
        where: { id: req.params.id },
        data: { name, type, warden, contact, messTimings, facilities, location }
      });
      res.json({ success: true, hostel });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/hostels/:id', async (req, res) => {
    try {
      await prisma.hostel.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ---------- Library Books (Smart Library Information) ----------
  router.post('/library', async (req, res) => {
    try {
      const { title, author, category, callNumber, totalCopies, availableCopies } = req.body;
      if (!title || !author || !category || !callNumber) {
        return res.status(400).json({ error: 'title, author, category and callNumber are required' });
      }
      const book = await prisma.libraryBook.create({
        data: {
          title,
          author,
          category,
          callNumber,
          totalCopies: totalCopies ?? 1,
          availableCopies: availableCopies ?? totalCopies ?? 1,
          createdById: req.staff.id
        }
      });
      res.json({ success: true, book });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/library/:id', async (req, res) => {
    try {
      const { title, author, category, callNumber, totalCopies, availableCopies } = req.body;
      const book = await prisma.libraryBook.update({
        where: { id: req.params.id },
        data: { title, author, category, callNumber, totalCopies, availableCopies }
      });
      res.json({ success: true, book });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/library/:id', async (req, res) => {
    try {
      await prisma.libraryBook.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ---------- Freshers' Welcome Poster Generator (Nano Banana) ----------
  // Explicitly required by the submitted problem statement: "create a
  // Freshers' Welcome Party poster using Nano Banana." Staff-only since
  // this is a promotional-asset tool for office admins/faculty to run.
  router.post('/poster', async (req, res) => {
    try {
      if (!isGeminiAvailable()) {
        return res.status(503).json({
          error: 'Gemini API key not configured. Set GEMINI_API_KEY in backend/.env to enable poster generation.'
        });
      }

      const { eventName, date, venue, theme } = req.body;
      const image = await generateWelcomePoster({ eventName, date, venue, theme });

      if (!image) {
        return res.status(502).json({ error: 'Poster generation failed or timed out. Please try again.' });
      }

      res.json({
        success: true,
        mimeType: image.mimeType,
        // data URI so the frontend can drop this straight into an <img src>
        dataUrl: `data:${image.mimeType};base64,${image.base64}`
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
