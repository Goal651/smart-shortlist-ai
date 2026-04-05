import { ApiResponse } from '@/types/api';
import { Job } from '@/types/Job';
import { Candidate } from '@/types/Candidate';
import { CreateJobRequest, ScreeningResponse } from '@/types/request';
import { apiClient } from './client';
import { API_ENDPOINTS } from './constant';

/**
 * Service for job-related API calls.
 */
class JobService {
  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<ApiResponse<Job[]>> {
    const response = await apiClient.get<Job[]>(API_ENDPOINTS.JOB.ALL);
    return response;
  }

  /**
   * Get job by ID
   */
  async getJobById(jobId: string): Promise<ApiResponse<Job>> {
    const response = await apiClient.get<Job>(API_ENDPOINTS.JOB.BY_ID(jobId));
    return response;
  }

  /**
   * Create a new job
   */
  async createJob(jobData: CreateJobRequest): Promise<ApiResponse<Job>> {
    const response = await apiClient.post<Job>(API_ENDPOINTS.JOB.CREATE, jobData);
    return response;
  }

  /**
   * Get candidates for a specific job
   */
  async getJobCandidates(jobId: string): Promise<ApiResponse<Candidate[]>> {
    const response = await apiClient.get<Candidate[]>(API_ENDPOINTS.JOB.CANDIDATES(jobId));
    return response;
  }

  /**
   * Run AI screening on uploaded resumes for a job
   */
  async screenResumes(jobId: string, files: File[]): Promise<ApiResponse<ScreeningResponse>> {
    // Create a custom method for multiple file upload since uploadFile only handles single file
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('resumes', file);
    });

    const response = await apiClient.post<ScreeningResponse>(
      API_ENDPOINTS.JOB.SCREEN(jobId),
      formData,
      { timeout: 30000 } // 30 second timeout for screening
    );
    return response;
  }

  /**
   * Get candidate details by ID
   */
  async getCandidateById(candidateId: string): Promise<ApiResponse<Candidate>> {
    const response = await apiClient.get<Candidate>(API_ENDPOINTS.JOB.CANDIDATE_BY_ID(candidateId));
    return response;
  }

  /**
   * Update job details
   */
  async updateJob(jobId: string, jobData: Partial<CreateJobRequest>): Promise<ApiResponse<Job>> {
    const response = await apiClient.put<Job>(API_ENDPOINTS.JOB.BY_ID(jobId), jobData);
    return response;
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(API_ENDPOINTS.JOB.BY_ID(jobId));
    return response;
  }

  /**
   * Update candidate status
   */
  async updateCandidateStatus(candidateId: string, status: Candidate['status']): Promise<ApiResponse<Candidate>> {
    const response = await apiClient.patch<Candidate>(API_ENDPOINTS.JOB.CANDIDATE_BY_ID(candidateId), { status });
    return response;
  }
}

export const jobService = new JobService();