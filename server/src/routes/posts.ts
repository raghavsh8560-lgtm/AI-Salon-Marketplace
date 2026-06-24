import { Router, Response } from 'express';
import { findPosts, createPost, toggleLikePost } from '../services/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all posts for timeline
router.get('/', async (req, res) => {
  try {
    const posts = await findPosts();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve posts.' });
  }
});

// Create new post (Owner only)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { image, video, content, category, salonId } = req.body;

  if (!content || !category || !salonId) {
    res.status(400).json({ error: 'Content, category, and salonId are required.' });
    return;
  }

  try {
    // Basic authorization check
    if (req.user?.role !== 'OWNER' && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Only salon owners can create posts.' });
      return;
    }

    const post = await createPost({
      salonId,
      image: image || null,
      video: video || null,
      content,
      category,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

// Like/Unlike a post
router.post('/:id/like', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    const post = await toggleLikePost(id as string, userId);
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to like/unlike post.' });
  }
});

export default router;
