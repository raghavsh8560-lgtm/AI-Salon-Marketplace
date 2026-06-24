import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import {
  findChatSessionsByUserId,
  findChatSessionById,
  createChatSession,
  createChatMessage,
  deleteChatSession,
  updateAIAnalyticsStats,
  findUserById
} from '../services/db.js';
import { streamGeminiChat, detectIntent } from '../services/geminiService.js';

const router = Router();

// List all chat sessions for the authenticated user
router.get('/sessions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessions = await findChatSessionsByUserId(req.user!.id);
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve chat sessions.' });
  }
});

// Get messages for a specific session
router.get('/sessions/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;

  try {
    const session = await findChatSessionById(id);

    if (!session) {
      res.status(404).json({ error: 'Chat session not found.' });
      return;
    }

    if (session.userId !== req.user!.id) {
      res.status(403).json({ error: 'Unauthorized session access.' });
      return;
    }

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve session details.' });
  }
});

// Delete a session
router.delete('/sessions/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;

  try {
    const session = await findChatSessionById(id);
    if (!session) {
      res.status(404).json({ error: 'Chat session not found.' });
      return;
    }

    if (session.userId !== req.user!.id) {
      res.status(403).json({ error: 'Unauthorized session deletion.' });
      return;
    }

    await deleteChatSession(id);
    res.json({ message: 'Session deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete chat session.' });
  }
});

// Stream Gemini Chat & Persistence
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { query, sessionId, sessionTitle } = req.body;

  if (!query) {
    res.status(400).json({ error: 'Query is required.' });
    return;
  }

  const userId = req.user!.id;
  const currentSessionId = sessionId || `session-${Math.random().toString(36).substring(2, 9)}`;
  const currentSessionTitle = sessionTitle || query.slice(0, 30) + (query.length > 30 ? '...' : '');

  try {
    // 1. Fetch user profile and existing session history
    const user = await findUserById(userId);
    
    let dbSession = await findChatSessionById(currentSessionId);
    if (!dbSession) {
      dbSession = await createChatSession(currentSessionId, currentSessionTitle, userId);
    }

    // Save user message in DB
    await createChatMessage(currentSessionId, 'user', query);

    // Reload messages to get complete history
    const sessionDetail = await findChatSessionById(currentSessionId);
    const messages = sessionDetail?.messages || [];

    // Format history for Gemini
    const geminiHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.sender === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: m.text }],
    }));

    // Detect Intent
    const intent = await detectIntent(query);

    // Setup Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send session headers first
    res.write(`data: ${JSON.stringify({ sessionId: currentSessionId, sessionTitle: currentSessionTitle, intent })}\n\n`);

    // Stream from Gemini
    await streamGeminiChat(
      query,
      geminiHistory,
      user,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      },
      async (fullText, recommendedSalons, recommendedProducts) => {
        try {
          // Save AI response in DB
          await createChatMessage(currentSessionId, 'ai', fullText, recommendedSalons, recommendedProducts);

          // Update Admin AI Analytics
          await updateAIAnalyticsStats(query, recommendedSalons);
        } catch (dbError) {
          console.error('Failed to save AI session/analytics details in background:', dbError);
        }

        // Send recommendations metadata back to the client
        res.write(`data: ${JSON.stringify({ recommendedSalons, recommendedProducts })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    );
  } catch (error) {
    console.error('Chat routing error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to connect to AI Assistant.' })}\n\n`);
    res.end();
  }
});

export default router;
