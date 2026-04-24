import { Request, Response } from 'express';
import Candidate from '../models/Candidate';
import Analysis from '../models/Analysis';

export class CandidateController {
  static async getCandidatesByJob(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const candidates = await Candidate.find({ jobId })
        .select('-extractedText')
        .sort({ 'aiAnalysis.score': -1 });
      res.json(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  }

  static async getCandidateById(req: Request, res: Response) {
    try {
      const candidate = await Candidate.findById(req.params.id);
      if (!candidate) return res.status(404).json({ error: "Candidate not found" });
      res.json(candidate);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      res.status(500).json({ error: "Failed to fetch candidate details" });
    }
  }

  static async getRecentAnalyses(req: Request, res: Response) {
    try {
      const recent = await Analysis.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('-__v');

      res.json(recent);
    } catch (error) {
      console.error('Error fetching recent analyses:', error);
      res.status(500).json({ error: "Failed to fetch recent analyses" });
    }
  }

  static async getAnalysisDetails(req: Request, res: Response) {
    try {
      const analysis = await Analysis.findById(req.params.id).select('-__v');
      if (!analysis) return res.status(404).json({ error: "Analysis record not found" });

      const candidateIds = analysis.results.map(r => r.candidateId);
      const topCandidates = await Candidate.find({ _id: { $in: candidateIds } })
        .sort({ 'aiAnalysis.score': -1 })
        .select('firstName lastName email aiAnalysis socialLinks');

      res.json({
        ...analysis.toObject(),
        topCandidates,
      });
    } catch (error) {
      console.error('Failed to fetch analysis details:', error);
      res.status(500).json({ error: "Failed to fetch analysis details" });
    }
  }
}
