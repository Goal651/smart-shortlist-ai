import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import Job from './models/Job';
import Candidate from './models/Candidate';
import Analysis from './models/Analysis';
import User from './models/User';
import Application from './models/Application';
import { ProcessingService } from './services/processingService';
import { GeminiService } from './services/geminiService';
import { authenticateToken, requireOwner, generateToken } from './middleware/auth';

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
    const { title, description, location, type, requirements, salaryRange } = req.body;
    if (!title || !description || description.length < 100) {
      return res.status(400).json({ error: "Job title and description (min 100 chars) are required." });
    }
    const job = new Job({ 
      title, 
      description, 
      location: location || "Remote",
      type: type || "Full-time",
      requirements: requirements || {
        skills: [],
        minExperience: 0,
        education: ""
      },
      salaryRange: salaryRange || {
        currency: "RWF"
      }
    });
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
 * Update job (owner only)
 * PATCH /api/jobs/:id
 */
app.patch('/api/jobs/:id', authenticateToken, requireOwner, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const job = await Job.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: "Failed to update job" });
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

/**
 * PUBLIC ENDPOINTS - No authentication required
 */

/**
 * Get all active public jobs
 * GET /api/jobs/public
 */
app.get('/api/jobs/public', async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .select('title description location type requirements salaryRange createdAt')
      .sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching public jobs:', error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

/**
 * Get specific public job details
 * GET /api/jobs/:id/public
 */
app.get('/api/jobs/:id/public', async (req: Request, res: Response) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, isActive: true })
      .select('title description location type requirements salaryRange createdAt');
    
    if (!job) {
      return res.status(404).json({ error: "Job not found or not active" });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error fetching public job:', error);
    res.status(500).json({ error: "Failed to fetch job details" });
  }
});

/**
 * Submit job application
 * POST /api/applications
 */
app.post('/api/applications', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    const { jobId, name, email, phone, linkedin } = req.body;
    const file = req.file;

    // Validation
    if (!jobId || !name || !email || !file) {
      return res.status(400).json({ 
        error: "Missing required fields: jobId, name, email, resume" 
      });
    }

    // Validate job exists and is active
    const job = await Job.findOne({ _id: jobId, isActive: true });
    if (!job) {
      return res.status(404).json({ error: "Job not found or not active" });
    }

    // Extract name from resume if possible
    let extractedName = name;
    try {
      const text = await ProcessingService.extractText(file.buffer, file.originalname);
      const firstName = extractFirstName(text);
      if (firstName && firstName.length > 0) {
        extractedName = firstName;
      }
    } catch (error) {
      console.warn('Could not extract name from resume:', error);
    }

    // Create application
    const application = new Application({
      jobId: new mongoose.Types.ObjectId(jobId),
      name: extractedName,
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      linkedin: linkedin?.trim(),
      resumeFile: {
        filename: `${Date.now()}-${file.originalname}`,
        originalName: file.originalname,
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size
      },
      status: 'Applied'
    });

    await application.save();
    
    console.log(`New application submitted: ${application.name} for job ${job.title}`);
    
    res.status(201).json({
      message: "Application submitted successfully",
      application: {
        _id: application._id,
        name: application.name,
        email: application.email,
        jobTitle: job.title,
        submittedAt: application.submittedAt,
        status: application.status
      }
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

/**
 * OWNER ENDPOINTS - Authentication required
 */

/**
 * Get all applications (owner only)
 * GET /api/applications
 */
app.get('/api/applications', authenticateToken, requireOwner, async (req: any, res: Response) => {
  try {
    const { jobId, status, page = 1, limit = 20 } = req.query;
    
    // Build filter
    const filter: any = {};
    if (jobId) filter.jobId = jobId;
    if (status) filter.status = status;
    
    const applications = await Application.find(filter)
      .populate('jobId', 'title location type')
      .sort({ submittedAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Application.countDocuments(filter);
    
    res.json({
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

/**
 * Trigger AI screening for application (owner only)
 * POST /api/applications/:id/screen
 */
app.post('/api/applications/:id/screen', authenticateToken, requireOwner, async (req: any, res: Response) => {
  try {
    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.status === 'Screening' || application.candidateId) {
      return res.status(400).json({ error: "Application already screened" });
    }

    // Update status to screening
    application.status = 'Screening';
    await application.save();

    // Extract text from resume
    const text = await ProcessingService.extractText(
      application.resumeFile.buffer, 
      application.resumeFile.originalName
    );
    
    // Get job details
    const job = application.jobId as any;
    
    // Use Gemini AI to analyze
    const analysisResults = await GeminiService.screenResumes(job.description, [text]);
    const analysis = analysisResults[0]; // Get first result
    
    // Create candidate record
    const candidate = new Candidate({
      jobId: application.jobId,
      name: application.name,
      email: application.email,
      linkedin: application.linkedin,
      score: analysis.score,
      summary: analysis.summary,
      top_skills: analysis.top_skills,
      gaps: analysis.gaps,
      status: analysis.score > 75 ? 'Shortlisted' : 'Review',
      extractedText: text
    });
    
    await candidate.save();
    
    // Update application with screening results
    application.candidateId = candidate._id;
    application.score = analysis.score;
    application.summary = analysis.summary;
    application.topSkills = analysis.top_skills;
    application.gaps = analysis.gaps;
    application.extractedText = text;
    application.screenedAt = new Date();
    // Map candidate status to application status
    const statusMap: Record<string, 'Applied' | 'Screening' | 'Shortlisted' | 'Rejected'> = {
      'Shortlisted': 'Shortlisted',
      'Review': 'Screening', 
      'Rejected': 'Rejected'
    };
    application.status = statusMap[candidate.status] || 'Screening';
    await application.save();
    
    console.log(`Screened application: ${application.name} - Score: ${analysis.score}`);
    
    res.json({
      message: "Application screened successfully",
      screening: {
        score: analysis.score,
        summary: analysis.summary,
        topSkills: analysis.top_skills,
        gaps: analysis.gaps,
        status: candidate.status
      }
    });

  } catch (error) {
    console.error('Error screening application:', error);
    res.status(500).json({ error: "Failed to screen application" });
  }
});

/**
 * Helper function to extract first name from resume text
 */
function extractFirstName(text: string): string | null {
  // Common patterns for name extraction
  const patterns = [
    /^(.+?)\s+(?:Email|Phone|LinkedIn|CONTACT)/im,
    /^(.+?)\s+(?:EXPERIENCE|EDUCATION|PROFESSIONAL|SKILLS)/im,
    /^(.+?)\s+\d{4}/im,
    /^(.+?)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s+\d{4}/im
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Return first name only
      const firstName = name.split(' ')[0];
      if (firstName.length > 1 && firstName.length < 50) {
        return firstName;
      }
    }
  }
  
  return null;
}

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

    // Generate JWT token
    const token = generateToken(owner._id.toString());

    // Return owner info and token
    res.json({
      message: "Login successful",
      token,
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

/**
 * Get Current User Profile
 * GET /api/auth/me
 */
app.get('/api/auth/me', authenticateToken, (req: any, res: Response) => {
  res.json({
    user: {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      company: req.user.company,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt
    }
  });
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

