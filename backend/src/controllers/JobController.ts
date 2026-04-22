import { Request, Response } from 'express';
import Job from '../models/Job';
import Application from '../models/Application';
import Candidate from '../models/Candidate';

export class JobController {
  static async createJob(req: Request, res: Response) {
    try {
      const { title, description, location, type, requirements, salaryRange, owner } = req.body;
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
        },
        owner: owner || (req as any).user?._id,
        isActive: true
      });
      await job.save();
      res.status(201).json(job);
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ error: "Failed to create job" });
    }
  }

  static async getJobs(req: Request, res: Response) {
    try {
      const jobs = await Job.find().sort({ createdAt: -1 });
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  }

  static async getPublicJobs(req: Request, res: Response) {
    try {
      const jobs = await Job.find({ isActive: true })
        .select('title description location type requirements salaryRange createdAt')
        .sort({ createdAt: -1 });

      res.json(jobs);
    } catch (error) {
      console.error('Error fetching public jobs:', error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  }

  static async getPublicJobById(req: Request, res: Response) {
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
  }

  static async getJobById(req: Request, res: Response) {
    try {
      console.log('🔍 GET Job By ID:', req.params.id);
      const job = await Job.findById(req.params.id);
      if (!job) {
        console.log('❌ Job not found in DB for ID:', req.params.id);
        return res.status(404).json({ error: "Job not found" });
      }
      
      console.log('✅ Job found:', job.title);
      // Check ownership if not admin
      const user = (req as any).user;
      if (job.owner && job.owner.toString() !== user._id.toString() && user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(job);
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({ error: "Failed to fetch job" });
    }
  }

  static async updateJob(req: Request, res: Response) {
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
  }

  static async deleteJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const job = await Job.findById(id);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Check ownership
      const user = (req as any).user;
      if (job.owner && job.owner.toString() !== user._id.toString() && user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }

      await Job.findByIdAndDelete(id);
      
      // Delete related applications and candidates
      await Application.deleteMany({ jobId: id });
      await Candidate.deleteMany({ jobId: id });

      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error('Error deleting job:', error);
      res.status(500).json({ error: "Failed to delete job" });
    }
  }
}
