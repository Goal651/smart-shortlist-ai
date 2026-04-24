export interface Candidate {
  _id: string;
  jobId: string;
  firstName: string;
  lastName: string;
  name?: string;
  score?: number; // Keep for compatibility if needed, but primary is in aiAnalysis
  summary?: string;
  top_skills?: string[];
  gaps?: string[];
  aiAnalysis?: {
    score: number;
    summary: string;
    topSkills: string[];
    gaps: string[];
    reasoning?: string;
    recommendations?: string[];
  };
  status: 'Applied' | 'Screening' | 'Shortlisted' | 'Rejected';
  email: string;
  linkedin?: string;
  createdAt: string;
}