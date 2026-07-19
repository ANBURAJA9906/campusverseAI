// AI Senior Mentor Community Routes
// A lightweight social layer where freshers/students can post questions,
// share projects, and get comment responses. This is student-facing (uses
// the existing single-active-student demo pattern), NOT staff-gated —
// separate concern from the Admin/Faculty portal.

import express from 'express';

export function createCommunityRouter(prisma, getActiveStudent) {
  const router = express.Router();

  // GET /api/community/posts — feed, newest first
  router.get('/posts', async (req, res) => {
    try {
      const posts = await prisma.communityPost.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { name: true, department: true, year: true } },
          comments: {
            orderBy: { createdAt: 'asc' },
            include: { student: { select: { name: true, year: true } } }
          }
        }
      });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/community/posts/:id — single post with full comment thread
  router.get('/posts/:id', async (req, res) => {
    try {
      const post = await prisma.communityPost.findUnique({
        where: { id: req.params.id },
        include: {
          student: { select: { name: true, department: true, year: true } },
          comments: {
            orderBy: { createdAt: 'asc' },
            include: { student: { select: { name: true, year: true } } }
          }
        }
      });
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/community/posts — create a new post as the active student
  router.post('/posts', async (req, res) => {
    try {
      const { title, content, tags } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: 'title and content are required' });
      }
      const student = await getActiveStudent();
      const post = await prisma.communityPost.create({
        data: {
          studentId: student.id,
          title,
          content,
          tags: tags || ''
        }
      });
      res.json({ success: true, post });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/community/posts/:id/comments — reply to a post
  router.post('/posts/:id/comments', async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'content is required' });
      }
      const post = await prisma.communityPost.findUnique({ where: { id: req.params.id } });
      if (!post) return res.status(404).json({ error: 'Post not found' });

      const student = await getActiveStudent();
      const comment = await prisma.communityComment.create({
        data: {
          postId: post.id,
          studentId: student.id,
          content
        }
      });
      res.json({ success: true, comment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
