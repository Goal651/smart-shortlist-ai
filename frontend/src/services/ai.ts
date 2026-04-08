import { ApiResponse } from '@/types/api';
import { ScreeningResponse } from '@/types/request';
import { apiClient } from './client';
import { API_ENDPOINTS } from './constant';
import { AxiosProgressEvent } from 'axios';

/**
 * Service for AI-related operations and file uploads.
 */
class AIService {
  /**
   * Run AI screening on uploaded resumes for a job
   */
  async screenResumes(jobId: string, files: File[]): Promise<ApiResponse<ScreeningResponse>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('resumes', file);
    });

    const response = await apiClient.postFormData<ScreeningResponse>(
      API_ENDPOINTS.JOB.SCREEN(jobId),
      formData,
      { timeout: 120000 } // 2 minutes for Gemini processing + PDF extraction + DB operations
    );
    return response;
  }

  /**
   * Upload single file (avatar, document, etc.)
   */
  async uploadFile(
    endpoint: string,
    file: File,
    onUploadProgress?: (event: AxiosProgressEvent) => void,
    timeout?: number
  ): Promise<ApiResponse<{ url: string; filename: string }>> {
    const response = await apiClient.uploadFile<{ url: string; filename: string }>(
      endpoint,
      file,
      onUploadProgress,
      undefined,
      timeout || 20000
    );
    return response;
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    endpoint: string,
    files: File[],
    onUploadProgress?: (event: AxiosProgressEvent) => void,
    timeout?: number
  ): Promise<ApiResponse<{ urls: string[]; filenames: string[] }>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    const response = await apiClient.post<{ urls: string[]; filenames: string[] }>(
      endpoint,
      formData,
      { timeout: timeout || 30000 }
    );
    return response;
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
    const response = await this.uploadFile('/upload/user', file);
    return response;
  }

  /**
   * Upload chat message file
   */
  async uploadMessageFile(file: File): Promise<ApiResponse<{ url: string }>> {
    const response = await this.uploadFile('/upload/message', file);
    return response;
  }

  /**
   * Upload generic file
   */
  async uploadGenericFile(file: File): Promise<ApiResponse<{ url: string }>> {
    const response = await this.uploadFile('/upload', file);
    return response;
  }

  /**
   * Analyze document with AI (future feature)
   */
  async analyzeDocument(file: File, analysisType: 'resume' | 'job-description' | 'general'): Promise<ApiResponse<{
    analysis: string;
    confidence: number;
    extractedText?: string;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('analysisType', analysisType);

    const response = await apiClient.post<{
      analysis: string;
      confidence: number;
      extractedText?: string;
    }>('/ai/analyze', formData, { timeout: 25000 });
    return response;
  }

  /**
   * Get AI insights for a job
   */
  async getJobInsights(jobId: string): Promise<ApiResponse<{
    recommendedSkills: string[];
    marketAnalysis: string;
    salaryRange: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>> {
    const response = await apiClient.get<{
      recommendedSkills: string[];
      marketAnalysis: string;
      salaryRange: string;
      difficulty: 'easy' | 'medium' | 'hard';
    }>(`/ai/job-insights/${jobId}`);
    return response;
  }

  /**
   * Get candidate match score with job
   */
  async getCandidateMatch(candidateId: string, jobId: string): Promise<ApiResponse<{
    score: number;
    matchReasons: string[];
    gaps: string[];
    recommendations: string[];
  }>> {
    const response = await apiClient.get<{
      score: number;
      matchReasons: string[];
      gaps: string[];
      recommendations: string[];
    }>(`/ai/match/${candidateId}/${jobId}`);
    return response;
  }
}

export const aiService = new AIService();
