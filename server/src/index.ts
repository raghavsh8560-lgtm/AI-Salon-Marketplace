import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import salonRoutes from './routes/salons.js';
import bookingRoutes from './routes/bookings.js';
import chatRoutes from './routes/chat.js';
import analyticsRoutes from './routes/analytics.js';
import postRoutes from './routes/posts.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow all client queries in local testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(morgan('dev'));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/posts', postRoutes);

import { authenticateToken } from './middleware/auth.js';
import { getNotificationsByUserId, markNotificationsAsRead } from './services/notifications.js';

app.get('/api/notifications', authenticateToken, (req: any, res: any) => {
  const notifs = getNotificationsByUserId(req.user.id);
  res.json(notifs);
});

app.post('/api/notifications/read', authenticateToken, (req: any, res: any) => {
  markNotificationsAsRead(req.user.id);
  res.json({ success: true });
});

// Root path status
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'SalonAI V2 Backend Engine', time: new Date() });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 SalonAI V2 Backend Server running at http://localhost:${PORT}`);
});
