"use client";

import React, { useCallback, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { ApiResponse } from '@/types/api';
import { Job } from '@/types/Job';
import { Candidate } from '@/types/Candidate';
import { CreateJobRequest, ScreeningResponse } from '@/types/request';
import { jobService } from '@/services/job';
import { candidateService } from '@/services/candidate';
import { aiService } from '@/services/ai';

// Hook for job-related operations
export const useJobs = () => {
  const { state, actions } = useAppContext();

  // Auto-fetch jobs on mount if not already loaded
  useEffect(() => {
    if (state.jobs.length === 0 && !state.loading.jobs) {
      actions.fetchJobs();
    }
  }, [state.jobs.length, state.loading.jobs]); // Removed actions.fetchJobs to prevent infinite loops

  // Create a new job using service
  const createJob = useCallback(async (jobData: CreateJobRequest): Promise<Job> => {
    return await actions.createJob(jobData);
  }, [actions.createJob]);

  const updateJob = useCallback(async (jobId: string, jobData: Partial<CreateJobRequest>): Promise<Job> => {
    return await actions.updateJob(jobId, jobData);
  }, [actions.updateJob]);

  return {
    jobs: state.jobs,
    loading: state.loading.jobs,
    error: state.error,
    fetchJobs: actions.fetchJobs,
    createJob,
    updateJob,
  };
};

// Hook for public job listings (no auth required)
export const usePublicJobs = () => {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPublicJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await jobService.getPublicJobs();
      if (res.success && res.data) {
        setJobs(res.data);
      } else {
        throw new Error(res.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchPublicJobs();
  }, [fetchPublicJobs]);

  return {
    jobs,
    loading,
    error,
    fetchJobs: fetchPublicJobs,
  };
};

// Hook for candidate screening operations
export const useScreening = (jobId?: string) => {
  const { state, actions } = useAppContext();

  // Auto-fetch candidates when jobId changes
  useEffect(() => {
    if (jobId && !state.loading.candidates) {
      actions.fetchCandidates(jobId);
    }
  }, [jobId]); // Removed actions.fetchCandidates to prevent infinite loops

  // Run Gemini AI screening on uploaded resumes using service
  const runGeminiScreening = useCallback(async (id: string, files: File[]): Promise<ScreeningResponse> => {
    return await actions.runGeminiScreening(id, files);
  }, [actions.runGeminiScreening]);

  // Filter candidates for the specific job
  const candidates = jobId ? state.selectedJobCandidates : [];

  // Calculate statistics
  const stats = {
    total: candidates.length,
    shortlisted: candidates.filter(c => c.status === 'Shortlisted').length,
    reviewing: candidates.filter(c => c.status === 'Review').length,
    rejected: candidates.filter(c => c.status === 'Rejected').length,
    averageScore: candidates.length > 0
      ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)
      : 0,
  };

  // Get top candidates (score > 75)
  const topCandidates = candidates
    .filter(c => c.score > 75)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return {
    candidates,
    topCandidates,
    stats,
    loading: {
      candidates: state.loading.candidates,
      screening: state.loading.screening,
    },
    error: state.error,
    fetchCandidates: actions.fetchCandidates,
    runGeminiScreening,
    clearError: actions.clearError,
  };
};

// Hook for AI operations and file uploads
export const useAI = () => {
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  // Upload single file with progress tracking
  const uploadFile = useCallback(async (
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await aiService.uploadFile(
        endpoint,
        file,
        (event) => {
          const progress = event.total ? Math.round((event.loaded * 100) / event.total) : 0;
          setUploadProgress(progress);
          onProgress?.(progress);
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Upload failed');
      }

      return response.data;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Upload multiple files
  const uploadMultipleFiles = useCallback(async (
    endpoint: string,
    files: File[],
    onProgress?: (progress: number) => void
  ) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await aiService.uploadMultipleFiles(
        endpoint,
        files,
        (event) => {
          const progress = event.total ? Math.round((event.loaded * 100) / event.total) : 0;
          setUploadProgress(progress);
          onProgress?.(progress);
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Upload failed');
      }

      return response.data;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Screen resumes (main AI functionality)
  const screenResumes = useCallback(async (jobId: string, files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await aiService.screenResumes(jobId, files);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Screening failed');
      }

      return response.data;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Screen resumes against custom JD
  const customScreenResumes = useCallback(async (customJD: string, jdFile: File | null, files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await aiService.customScreenResumes(customJD, jdFile, files);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Custom screening failed');
      }

      return response.data;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Upload avatar
  const uploadAvatar = useCallback(async (file: File) => {
    return await uploadFile('/upload/user', file);
  }, [uploadFile]);

  // Upload generic file
  const uploadGenericFile = useCallback(async (file: File) => {
    return await uploadFile('/upload', file);
  }, [uploadFile]);

  return {
    uploadFile,
    uploadMultipleFiles,
    screenResumes,
    customScreenResumes,
    uploadAvatar,
    uploadGenericFile,
    uploadProgress,
    isUploading,
  };
};
