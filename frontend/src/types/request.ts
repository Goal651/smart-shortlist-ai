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
export interface ScreeningResponse {
  processed: number;
  candidates: Candidate[];
}

export type JobsListResponse = Job[];

// API Request types
export interface CreateJobRequest {
  title: string;
  description: string;
}

export interface ScreeningRequest {
  jobId: string;
  files: File[];
}

