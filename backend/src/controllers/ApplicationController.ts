import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Application from '../models/Application';
import Job from '../models/Job';
import Candidate from '../models/Candidate';
import Analysis from '../models/Analysis';
import { ProcessingService } from '../services/processingService';
import { GeminiService } from '../services/geminiService';

export class ApplicationController {
  /**
   * Public: Submit a single application
   */
  static async submitApplication(req: Request, res: Response) {
    try {
      const { jobId, firstName, lastName, email, phone } = req.body;
      const file = req.file;

      if (!jobId || !firstName || !lastName || !email || !file) {
        return res.status(400).json({ 
          error: "Missing required fields: jobId, firstName, lastName, email, resume" 
        });
      }

      const job = await Job.findOne({ _id: jobId, isActive: true });
      if (!job) {
        return res.status(404).json({ error: "Job not found or not active" });
      }

      // Extract text from resume
      const text = await ProcessingService.extractText(file.buffer, file.originalname);

      // Create application
      const application = new Application({
        jobId: new mongoose.Types.ObjectId(jobId),
        firstName,
        lastName,
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        resumeFile: {
          filename: `${Date.now()}-${file.originalname}`,
          originalName: file.originalname,
          buffer: file.buffer,
          mimeType: file.mimetype,
          size: file.size
        },
        extractedText: text,
        status: 'Applied'
      });

      await application.save();
      
      res.status(201).json({
        message: "Application submitted successfully",
        application: {
          _id: application._id,
          firstName: application.firstName,
          lastName: application.lastName,
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
  }

  /**
   * Owner: Bulk screen resumes for a job
   */
  static async bulkScreen(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No resumes uploaded." });
      }

      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ error: "Job not found" });

      console.log('📁 Processing', files.length, 'files for job:', job.title);

      // 1. Text Extraction
      let resumeData: { originalName: string; text: string; buffer: Buffer; mimetype: string; size: number }[] = [];
      
      for (const file of files) {
        try {
          const text = await ProcessingService.extractText(file.buffer, file.originalname);
          console.log('✅ Extracted text from:', file.originalname, '(', text.length, 'chars)');
          resumeData.push({ 
            originalName: file.originalname, 
            text, 
            buffer: file.buffer, 
            mimetype: file.mimetype, 
            size: file.size 
          });
        } catch (err) {
          console.warn('⚠️ Skipping corrupt file:', file.originalname);
        }
      }

      console.log('📊 Successfully extracted text from', resumeData.length, 'files');

      // Create analysis record
      const analysisRecord = new Analysis({
        jobId: job._id,
        jobTitle: job.title,
        jobDescription: job.description,
        fileCount: files.length,
        candidateCount: 0,
        topScore: 0,
        screened: false,
        results: []
      });
      await analysisRecord.save();
      console.log('📋 Created analysis record:', analysisRecord._id);

      const totalCandidates: any[] = [];
      const candidateScores: any[] = [];
      const BATCH_SIZE = 5;

      for (let i = 0; i < resumeData.length; i += BATCH_SIZE) {
        const batch = resumeData.slice(i, i + BATCH_SIZE);
        const batchTexts = batch.map(r => r.text);
        
        console.log(`🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} with ${batch.length} resumes`);
        
        try {
          const screeningResults = await GeminiService.screenResumes(job.description, batchTexts);
          console.log('✅ Gemini returned', screeningResults.length, 'results');
          
          for (let j = 0; j < screeningResults.length; j++) {
            const resData = screeningResults[j];
            const originalFile = batch[j];

            console.log('💾 Saving candidate:', resData.name, '(score:', resData.score, ')');

            // Parse name
            const nameParts = (resData.name || 'Unknown Candidate').trim().split(' ');
            const firstName = nameParts[0] || 'Unknown';
            const lastName = nameParts.slice(1).join(' ') || 'Candidate';

            // Create Candidate with required fields
            const candidate = new Candidate({
              jobId: job._id,
              firstName,
              lastName,
              email: resData.email || 'unknown@example.com',
              headline: job.title,
              location: 'Unknown',
              skills: (resData.top_skills || []).map(skill => ({
                name: skill,
                level: 'Intermediate' as const,
                yearsOfExperience: 2
              })),
              languages: [{ name: 'English', proficiency: 'Fluent' as const }],
              experience: [],
              education: [],
              certifications: [],
              projects: [],
              availability: {
                status: 'Available' as const,
                type: 'Full-time' as const
              },
              socialLinks: {
                linkedin: resData.linkedin
              },
              aiAnalysis: {
                score: resData.score || 0,
                summary: resData.summary || '',
                topSkills: resData.top_skills || [],
                gaps: resData.gaps || [],
                reasoning: resData.summary || '',
                recommendations: []
              },
              status: resData.status === 'Shortlisted' ? 'Shortlisted' : 
                      resData.status === 'Review' ? 'Screening' : 'Rejected',
              extractedText: originalFile.text,
              screenedAt: new Date()
            });

            await candidate.save();
            totalCandidates.push(candidate);

            // Add to analysis results
            candidateScores.push({
              candidateId: candidate._id,
              email: candidate.email,
              name: `${candidate.firstName} ${candidate.lastName}`,
              score: resData.score,
              summary: resData.summary,
              topSkills: resData.top_skills,
              gaps: resData.gaps
            });
          }
        } catch (error) {
          console.error('❌ Batch screening failed:', error);
        }
      }

      // Update analysis summary
      const topScore = totalCandidates.reduce((max, c) => Math.max(max, c.aiAnalysis?.score || 0), 0);
      const averageScore = totalCandidates.length > 0 
        ? totalCandidates.reduce((sum, c) => sum + (c.aiAnalysis?.score || 0), 0) / totalCandidates.length 
        : 0;

      analysisRecord.candidateCount = totalCandidates.length;
      analysisRecord.topScore = topScore;
      analysisRecord.averageScore = averageScore;
      analysisRecord.results = candidateScores;
      analysisRecord.screened = true;
      analysisRecord.completedAt = new Date();
      await analysisRecord.save();

      console.log('✅ Analysis complete! Processed', totalCandidates.length, 'candidates');

      res.json({ 
        processed: files.length,
        candidates: totalCandidates.sort((a, b) => (b.aiAnalysis?.score || 0) - (a.aiAnalysis?.score || 0)),
        analysis: analysisRecord,
      });

    } catch (error) {
      console.error('❌ Bulk Screening Error:', error);
      res.status(500).json({ error: "Screening process failed." });
    }
  }

  /**
   * Owner: Get applications with filters
   */
  static async getApplications(req: Request, res: Response) {
    try {
      const { jobId, status, page = 1, limit = 20 } = req.query;
      
      const filter: any = {};
      if (jobId) filter.jobId = jobId;
      if (status) filter.status = status;
      
      const applications = await Application.find(filter)
        .populate('jobId', 'title location type')
        .sort({ submittedAt: -1 })
        .limit(Number(limit))
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
  }

  /**
   * Owner: Screen a single application
   */
  static async screenApplication(req: Request, res: Response) {
    try {
      const application = await Application.findById(req.params.id).populate('jobId');
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      application.status = 'Screening';
      await application.save();

      const job = application.jobId as any;
      const screeningResults = await GeminiService.screenResumes(job.description, [application.extractedText]);
      const result = screeningResults[0];

      // Create candidate profile
      const candidate = new Candidate({
        jobId: job._id,
        applicationId: application._id,
        firstName: result.firstName || application.firstName,
        lastName: result.lastName || application.lastName,
        email: result.email || application.email,
        headline: result.headline || job.title,
        bio: result.bio,
        location: result.location || 'Unknown',
        skills: result.skills,
        languages: result.languages,
        experience: result.experience,
        education: result.education,
        availability: result.availability,
        socialLinks: result.socialLinks,
        aiAnalysis: result.aiAnalysis,
        status: result.status,
        extractedText: application.extractedText,
        screenedAt: new Date()
      });

      await candidate.save();

      // Update application
      application.candidateId = candidate._id;
      application.screeningResult = {
        score: result.aiAnalysis.score,
        summary: result.aiAnalysis.summary,
        topSkills: result.aiAnalysis.topSkills,
        gaps: result.aiAnalysis.gaps,
        reasoning: result.aiAnalysis.reasoning
      };
      application.status = result.status as any;
      application.screenedAt = new Date();
      await application.save();

      res.json({
        message: "Application screened successfully",
        candidate
      });

    } catch (error) {
      console.error('Error screening application:', error);
      res.status(500).json({ error: "Failed to screen application" });
    }
  }

  /**
   * Owner: Screen all existing applications for a job
   */
  static async screenAllExistingApplications(req: Request, res: Response) {
    console.log('🎯 screenAllExistingApplications called with jobId:', req.params.jobId);
    try {
      const { jobId } = req.params;
      const job = await Job.findById(jobId);
      if (!job) {
        console.log('❌ Job not found:', jobId);
        return res.status(404).json({ error: "Job not found" });
      }

      const applications = await Application.find({ jobId, status: 'Applied' });
      console.log(`📋 Found ${applications.length} applications with status 'Applied' for job ${jobId}`);
      
      if (applications.length === 0) {
        console.log('⚠️ No pending applications to screen');
        return res.status(400).json({ error: "No pending applications to screen for this job" });
      }

      const screenedCandidates = [];
      const BATCH_SIZE = 5;

      for (let i = 0; i < applications.length; i += BATCH_SIZE) {
        const batch = applications.slice(i, i + BATCH_SIZE);
        const batchTexts = batch.map(a => a.extractedText);
        
        console.log(`🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} with ${batch.length} applications`);
        
        try {
          const screeningResults = await GeminiService.screenResumes(job.description, batchTexts);
          
          for (let j = 0; j < screeningResults.length; j++) {
            const result = screeningResults[j];
            const app = batch[j];

            // Create candidate profile
            const candidate = new Candidate({
              jobId: job._id,
              applicationId: app._id,
              firstName: result.firstName || app.firstName,
              lastName: result.lastName || app.lastName,
              email: result.email || app.email,
              headline: result.headline || job.title,
              bio: result.bio,
              location: result.location || 'Unknown',
              skills: result.skills,
              languages: result.languages,
              experience: result.experience,
              education: result.education,
              availability: result.availability,
              socialLinks: result.socialLinks,
              aiAnalysis: result.aiAnalysis,
              status: result.status,
              extractedText: app.extractedText,
              screenedAt: new Date()
            });

            await candidate.save();

            // Update application
            app.candidateId = candidate._id;
            app.screeningResult = {
              score: result.aiAnalysis.score,
              summary: result.aiAnalysis.summary,
              topSkills: result.aiAnalysis.topSkills,
              gaps: result.aiAnalysis.gaps,
              reasoning: result.aiAnalysis.reasoning
            };
            app.status = result.status as any;
            app.screenedAt = new Date();
            await app.save();
            
            screenedCandidates.push(candidate);
          }
        } catch (error) {
          console.error(`❌ Batch screening failed for job ${jobId}:`, error);
        }
      }

      console.log(`✅ Successfully screened ${screenedCandidates.length} candidates`);

      // Create Analysis record
      const analysis = new Analysis({
        jobId: job._id,
        jobTitle: job.title,
        jobDescription: job.description,
        fileCount: applications.length,
        candidateCount: screenedCandidates.length,
        screened: true,
        topScore: screenedCandidates.reduce((max, c) => Math.max(max, c.aiAnalysis?.score || 0), 0),
        averageScore: screenedCandidates.length > 0 
          ? screenedCandidates.reduce((sum, c) => sum + (c.aiAnalysis?.score || 0), 0) / screenedCandidates.length 
          : 0,
        results: screenedCandidates.map(c => ({
          candidateId: c._id,
          email: c.email,
          name: `${c.firstName} ${c.lastName}`,
          score: c.aiAnalysis?.score || 0,
          summary: c.aiAnalysis?.summary || '',
          topSkills: c.aiAnalysis?.topSkills || [],
          gaps: c.aiAnalysis?.gaps || []
        })),
        completedAt: new Date()
      });

      await analysis.save();
      console.log(`📊 Analysis created with ID: ${analysis._id}`);

      res.json({
        message: `Successfully screened ${screenedCandidates.length} applications`,
        screenedCount: screenedCandidates.length,
        analysisId: analysis._id
      });

    } catch (error: any) {
      console.error('❌ Error screening all applications:', error);
      res.status(500).json({ 
        error: "Failed to screen applications", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}
