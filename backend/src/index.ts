import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import Job from './models/Job';
import Candidate from './models/Candidate';
import Analysis from './models/Analysis';
import User from './models/User';
import { ProcessingService } from './services/processingService';
import { GeminiService } from './services/geminiService';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Multi-upload configuration (In-Memory)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/umurava-ai';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Add middleware to log all requests
app.use((req, res, next) => {
  console.log('🌐 REQUEST:', req.method, req.url);
  next();
});

/**
 * Test endpoint for debugging
 */
app.get('/api/test', (req: Request, res: Response) => {
  console.log('TEST ENDPOINT CALLED!');
  res.json({ message: 'Test endpoint working', timestamp: new Date() });
});

/**
 * FR1: Job Description Management
 * POST /api/jobs
 */
app.post('/api/jobs', async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title || !description || description.length < 100) {
      return res.status(400).json({ error: "Job title and description (min 100 chars) are required." });
    }
    const job = new Job({ title, description });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
  }
});

/**
 * GET /api/jobs
 * List all job postings
 */
app.get('/api/jobs', async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

/**
 * FR2 & FR4: High-Performance Multi-Upload + AI Logic & Batching
 * POST /api/jobs/:jobId/screen
 */
app.post('/api/jobs/:jobId/screen', upload.array('resumes', 50), async (req: Request, res: Response) => {
  console.log('🚀 SCREENING ENDPOINT CALLED!');
  console.log('📁 Files received:', req.files?.length || 0);
  console.log('🆔 Job ID:', req.params.jobId);
  
  try {
    const { jobId } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      console.log('❌ No files uploaded');
      return res.status(400).json({ error: "No resumes uploaded." });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const totalResults: any[] = [];
    
    // 1. Text Extraction (Phase 1)
    let resumeData: { name: string; text: string }[] = [];
    console.log('Processing', files.length, 'files...');
    
    for (const file of files) {
      console.log('Processing file:', file.originalname, '(size:', file.buffer.length, 'bytes)');
      try {
        const text = await ProcessingService.extractText(file.buffer, file.originalname);
        console.log('Extracted text length:', text.length, 'characters');
        console.log('First 100 chars:', text.substring(0, 100) + '...');
        resumeData.push({ name: file.originalname, text });
        console.log('Successfully extracted text from:', file.originalname);
      } catch (err) {
        console.warn('Skipping corrupt file:', file.originalname, '- Error:', (err as Error).message);
      }
    }

    console.log('Successfully processed', resumeData.length, 'out of', files.length, 'files');

    // Persist the analysis summary before candidate save so candidates can be linked to it
    const analysisRecord = new Analysis({
      jobId: job._id,
      jobTitle: job.title,
      fileCount: files.length,
      candidateCount: 0,
      topScore: 0,
    });
    await analysisRecord.save();

    // 2. Batching Logic (5 resumes per call)
    const BATCH_SIZE = 5;
    for (let i = 0; i < resumeData.length; i += BATCH_SIZE) {
      const batch = resumeData.slice(i, i + BATCH_SIZE);
      const batchTexts = batch.map(r => r.text);
      console.log('Processing batch', (i/BATCH_SIZE + 1), 'with', batchTexts.length, 'resumes');
      
      try {
        console.log('Job description length:', job.description.length, 'chars');
        const screeningResults = await GeminiService.screenResumes(job.description, batchTexts);
        console.log('AI returned', screeningResults.length, 'results');
        
        // Match results with original names (based on order) and save to DB
        const savedCandidates = await Promise.all(
          screeningResults.map(async (res, index) => {
            console.log('Saving candidate:', res.name || batch[index].name, '(score:', res.score, ')');
            const candidate = new Candidate({
              jobId: job._id,
              analysisId: analysisRecord._id,
              name: res.name || batch[index].name,
              email: res.email,
              linkedin: res.linkedin,
              score: res.score,
              summary: res.summary,
              top_skills: res.top_skills,
              gaps: res.gaps,
              status: res.status,
              extractedText: batch[index].text
            });
            return await candidate.save();
          })
        );
        totalResults.push(...savedCandidates);
      } catch (error) {
        console.error('Batch screening failed', error);
      }
    }

    console.log('Final results: processed', files.length, 'files, created', totalResults.length, 'candidates');

    // Update analysis summary counts now that candidates are saved
    analysisRecord.candidateCount = totalResults.length;
    analysisRecord.topScore = totalResults.reduce((max, candidate) => Math.max(max, candidate.score || 0), 0);
    await analysisRecord.save();

    // FR3: In-Memory Processing (Privacy-First)
    // Clear heavy data from memory explicitly
    (resumeData as any) = null;

    res.json({ 
      processed: files.length,
      candidates: totalResults.sort((a, b) => b.score - a.score),
      analysis: analysisRecord,
    });

  } catch (error) {
    console.error('Screening Error:', error);
    res.status(500).json({ error: "Screening process failed." });
  }
});

/**
 * FR5: Dashboard & Visualization
 * GET /api/jobs/:jobId/candidates
 */
app.get('/api/jobs/:jobId/candidates', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const candidates = await Candidate.find({ jobId }).select('-extractedText').sort({ score: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

/**
 * GET /api/analyses/recent
 * Fetch recent screening analysis history
 */
app.get('/api/analyses/recent', async (req: Request, res: Response) => {
  try {
    const recent = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-__v');

    res.json(recent);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recent analyses" });
  }
});

/**
 * GET /api/analyses/:id
 * Fetch a single analysis with top candidate details for history modal
 */
app.get('/api/analyses/:id', async (req: Request, res: Response) => {
  try {
    const analysis = await Analysis.findById(req.params.id).select('-__v');
    if (!analysis) return res.status(404).json({ error: "Analysis record not found" });

    const topCandidates = await Candidate.find({ analysisId: analysis._id })
      .sort({ score: -1 })
      .limit(5)
      .select('name score summary email linkedin');

    res.json({
      ...analysis.toObject(),
      topCandidates,
    });
  } catch (error) {
    console.error('Failed to fetch analysis details', error);
    res.status(500).json({ error: "Failed to fetch analysis details" });
  }
});

/**
 * GET /api/candidates/:id
 * Get full candidate details (including AI reasoning and gaps)
 */
app.get('/api/candidates/:id', async (req: Request, res: Response) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch candidate details" });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: "Vetter API Online", 
    system: "TypeScript + Node.js",
    model: "Gemini 1.5 Flash"
  });
});

/**
 * Seed Owner User Endpoint
 * POST /api/seed/owner
 */
app.post('/api/seed/owner', async (req: Request, res: Response) => {
  try {
    // Check if owner already exists
    const existingOwner = await User.findOne({ role: 'owner' });
    if (existingOwner) {
      return res.status(400).json({ 
        error: "Owner user already exists",
        owner: {
          email: existingOwner.email,
          name: existingOwner.name,
          role: existingOwner.role
        }
      });
    }

    // Create owner user
    const bcrypt = require('bcryptjs');
    const ownerEmail = process.env.OWNER_EMAIL || 'owner@umurava.ai';
    const ownerPassword = process.env.OWNER_PASSWORD || 'Umurava2024!';
    const ownerName = process.env.OWNER_NAME || 'Umurava Owner';

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(ownerPassword, saltRounds);

    // Create owner
    const owner = new User({
      email: ownerEmail,
      password: hashedPassword,
      name: ownerName,
      role: 'owner',
      company: 'Umurava AI',
      isActive: true
    });

    await owner.save();
    
    console.log('Owner user created successfully!');
    console.log('Email:', ownerEmail);
    console.log('Name:', ownerName);

    res.status(201).json({ 
      message: "Owner user created successfully",
      owner: {
        email: owner.email,
        name: owner.name,
        role: owner.role,
        company: owner.company
      }
    });

  } catch (error) {
    console.error('Error seeding owner:', error);
    res.status(500).json({ error: "Failed to create owner user" });
  }
});

/**
 * Owner Login Endpoint
 * POST /api/auth/owner/login
 */
app.post('/api/auth/owner/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find owner user
    const owner = await User.findOne({ email: email.toLowerCase(), role: 'owner', isActive: true });
    if (!owner) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, owner.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    owner.lastLogin = new Date();
    await owner.save();

    // Return owner info (without password)
    res.json({
      message: "Login successful",
      owner: {
        _id: owner._id,
        email: owner.email,
        name: owner.name,
        role: owner.role,
        company: owner.company,
        lastLogin: owner.lastLogin,
        createdAt: owner.createdAt
      }
    });

  } catch (error) {
    console.error('Owner login error:', error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Catch-all route for debugging
app.use((req, res, next) => {
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

