import { ApiResponse } from '@/types/api';
import { Candidate } from '@/types/Candidate';
import { apiClient } from './client';
import { API_ENDPOINTS } from './constant';

/**
 * Service for candidate-related API calls.
 */
class CandidateService {
  /**
   * Get candidate by ID
   */
  async getCandidateById(candidateId: string): Promise<ApiResponse<Candidate>> {
    const response = await apiClient.get<Candidate>(API_ENDPOINTS.JOB.CANDIDATE_BY_ID(candidateId));
    return response;
  }

  /**
   * Update candidate status
   */
  async updateCandidateStatus(candidateId: string, status: Candidate['status']): Promise<ApiResponse<Candidate>> {
    const response = await apiClient.patch<Candidate>(API_ENDPOINTS.JOB.CANDIDATE_BY_ID(candidateId), { status });
    return response;
  }

  /**
   * Update candidate profile information
   */
  async updateCandidateProfile(candidateId: string, profileData: Partial<Candidate>): Promise<ApiResponse<Candidate>> {
    const response = await apiClient.put<Candidate>(API_ENDPOINTS.JOB.CANDIDATE_BY_ID(candidateId), profileData);
    return response;
  }

  /**
   * Add notes to candidate
   */
  async addCandidateNotes(candidateId: string, notes: string): Promise<ApiResponse<Candidate>> {
    const response = await apiClient.patch<Candidate>(API_ENDPOINTS.JOB.CANDIDATE_BY_ID(candidateId), { notes });
    return response;
  }

  /**
   * Delete candidate
   */
  async deleteCandidate(candidateId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(API_ENDPOINTS.JOB.CANDIDATE_BY_ID(candidateId));
    return response;
  }

  /**
   * Get all candidates across all jobs (admin function)
   */
  async getAllCandidates(): Promise<ApiResponse<Candidate[]>> {
    const response = await apiClient.get<Candidate[]>('/admin/candidates');
    return response;
  }

  /**
   * Search candidates by name or skills
   */
  async searchCandidates(query: string): Promise<ApiResponse<Candidate[]>> {
    const response = await apiClient.get<Candidate[]>(`/candidates/search?q=${encodeURIComponent(query)}`);
    return response;
  }

  /**
   * Get candidates by status across all jobs
   */
  async getCandidatesByStatus(status: Candidate['status']): Promise<ApiResponse<Candidate[]>> {
    const response = await apiClient.get<Candidate[]>(`/candidates/status/${status}`);
    return response;
  }
}

export const candidateService = new CandidateService();
