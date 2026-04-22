import { Request, Response } from 'express';
import Analysis from '../models/Analysis';

export class AnalysisController {
  static async getRecentAnalyses(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      // Get analyses for jobs owned by the user
      // Assuming we want to filter by user ownership eventually, 
      // but for now let's get recent ones.
      const analyses = await Analysis.find()
        .sort({ createdAt: -1 })
        .limit(10);
      
      res.json(analyses);
    } catch (error) {
      console.error('Error fetching recent analyses:', error);
      res.status(500).json({ error: "Failed to fetch analyses" });
    }
  }

  static async getAnalysisDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const analysis = await Analysis.findById(id).populate('results.candidateId');
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      
      // Map to the expected frontend format if needed
      // Based on AnalysisDetail type in frontend:
      // { _id, jobTitle, jobDescription, fileCount, candidateCount, topScore, results: [], topCandidates: [] }
      
      const response = {
        _id: analysis._id,
        jobId: analysis.jobId,
        jobTitle: analysis.jobTitle,
        jobDescription: analysis.jobDescription,
        fileCount: analysis.fileCount,
        candidateCount: analysis.candidateCount,
        topScore: analysis.topScore,
        averageScore: analysis.averageScore,
        results: analysis.results,
        topCandidates: analysis.results
          .sort((a, b) => b.score - a.score)
          .slice(0, 5),
        createdAt: analysis.createdAt
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching analysis detail:', error);
      res.status(500).json({ error: "Failed to fetch analysis details" });
    }
  }
}
