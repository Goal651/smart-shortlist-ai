// API Types for Frontend-Backend Integration
// Based on backend models: Job and Candidate

export interface Job {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Candidate {
  _id: string;
  jobId: string;
  name: string;
  score: number;
  summary: string;
  top_skills: string[]; // Backend uses snake_case
  gaps: string[];
  status: 'Shortlisted' | 'Review' | 'Rejected';
  email?: string;
  linkedin?: string;
  createdAt: string;
}

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

// Context state types
export interface AppState {
  jobs: Job[];
  selectedJobCandidates: CandidateWithUI[];
  loading: {
    jobs: boolean;
    candidates: boolean;
    screening: boolean;
  };
  error: string | null;
}

export interface AppActions {
  fetchJobs: () => Promise<void>;
  createJob: (job: CreateJobRequest) => Promise<Job>;
  fetchCandidates: (jobId: string) => Promise<void>;
  runGeminiScreening: (jobId: string, files: File[]) => Promise<ScreeningResponse>;
  clearError: () => void;
}
