import { Job } from "./Job";
import { CandidateWithUI, CreateJobRequest } from "./request";
import { ScreeningResponse } from "./response";

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
  updateJob: (jobId: string, job: Partial<CreateJobRequest>) => Promise<Job>;
  fetchCandidates: (jobId: string) => Promise<void>;
  runGeminiScreening: (jobId: string, files: File[]) => Promise<ScreeningResponse>;
  clearError: () => void;
}