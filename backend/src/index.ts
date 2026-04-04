import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import Job from './models/Job';
import Candidate from './models/Candidate';
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
  try {
    const { jobId } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No resumes uploaded." });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const totalResults: any[] = [];
    
    // 1. Text Extraction (Phase 1)
    let resumeData: { name: string; text: string }[] = [];
    for (const file of files) {
      try {
        const text = await ProcessingService.extractText(file.buffer);
        resumeData.push({ name: file.originalname, text });
      } catch (err) {
        console.warn(`Skipping corrupt file: ${file.originalname}`);
      }
    }

    // 2. Batching Logic (5 resumes per call)
    const BATCH_SIZE = 5;
    for (let i = 0; i < resumeData.length; i += BATCH_SIZE) {
      const batch = resumeData.slice(i, i + BATCH_SIZE);
      const batchTexts = batch.map(r => r.text);
      
      try {
        const screeningResults = await GeminiService.screenResumes(job.description, batchTexts);
        
        // Match results with original names (based on order) and save to DB
        const savedCandidates = await Promise.all(
          screeningResults.map(async (res, index) => {
            const candidate = new Candidate({
              jobId: job._id,
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

    // FR3: In-Memory Processing (Privacy-First)
    // Clear heavy data from memory explicitly
    (resumeData as any) = null;

    res.json({ 
      processed: files.length,
      candidates: totalResults.sort((a, b) => b.score - a.score) 
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

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend zooming on http://localhost:${PORT}`);
  });
}

export default app;

