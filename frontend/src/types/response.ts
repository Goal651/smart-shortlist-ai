// Response for: GET /api/jobs/:jobId/candidates

import { Candidate } from "./Candidate";
import { Job } from "./Job";

// and POST /api/jobs/:jobId/screen
export interface ScreeningResponse {
  processed: number;
  candidates: Candidate[];
}

// Response for: GET /api/jobs
export type JobsListResponse = Job[];