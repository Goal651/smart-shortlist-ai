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