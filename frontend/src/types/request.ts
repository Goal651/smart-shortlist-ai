import { Candidate } from "./Candidate";
import { Job } from "./Job";

// Frontend UI structure for AI reasoning (mapped from backend fields)
export interface AIReasoning {
  strengths: string[]; // Mapped from top_skills
  gaps: string[]; // Mapped from gaps
  recommendation: string; // Mapped from summary
  risks?: string[]; // Optional field for UI
}

// Enhanced Candidate interface with UI-specific fields
export interface CandidateWithUI extends Candidate {
  aiReasoning: AIReasoning;
  source?: string; // For UI display (e.g., "External PDF", "CSV Upload")
}

// API Response types
export interface RecentAnalysis {
  _id: string;
  jobTitle: string;
  fileCount: number;
  candidateCount: number;
  topScore: number;
  createdAt: string;
}

export interface AnalysisCandidateSummary {
  _id?: string;
  name: string;
  score: number;
  summary?: string;
  email?: string;
  linkedin?: string;
}

export interface AnalysisDetail extends RecentAnalysis {
  topCandidates: AnalysisCandidateSummary[];
}

export interface ScreeningResponse {
  processed: number;
  candidates: Candidate[];
  analysis?: RecentAnalysis;
}

export type JobsListResponse = Job[];

// API Request types
export interface CreateJobRequest {
  title: string;
  description: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  requirements: {
    skills: string[];
    minExperience: number;
    education: string;
  };
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface ScreeningRequest {
  jobId: string;
  files: File[];
}

