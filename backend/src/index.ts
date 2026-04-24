import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import Routes
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import candidateRoutes from './routes/candidateRoutes';
import analysisRoutes from './routes/analysisRoutes';
// Import Seeders
import seedOwner from './seed/seedOwner';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/umurava-ai';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    // Auto-seed owner user
    await seedOwner(false);
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/analyses', analysisRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: "Umurava AI Backend Online", 
    timestamp: new Date(),
    version: "2.0.0"
  });
});

// Test Endpoint
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Backend is working correctly with refactored architecture.' });
});

// 404 Handler
app.use((req, res) => {
  console.log('❌ NO ROUTE MATCHED:', req.method, req.url);
  res.status(404).json({ error: 'Route not found', url: req.url, method: req.method });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend zooming on http://localhost:${PORT}`);
  });
}

export default app;
