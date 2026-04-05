"use client";

import { useCallback, useEffect } from 'react';
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

  // Fetch all jobs
  const fetchJobs = useCallback(async () => {
    await actions.fetchJobs();
  }, [actions]);

  // Create a new job
  const createJob = useCallback(async (jobData: CreateJobRequest): Promise<Job> => {
    return await actions.createJob(jobData);
  }, [actions]);

  // Auto-fetch jobs on mount if not already loaded
  useEffect(() => {
    if (state.jobs.length === 0 && !state.loading.jobs) {
      fetchJobs();
    }
  }, [state.jobs.length, state.loading.jobs, fetchJobs]);

  return {
    jobs: state.jobs,
    loading: state.loading.jobs,
    error: state.error,
    fetchJobs,
    createJob,
  };
};

// Hook for candidate screening operations
export const useScreening = (jobId?: string) => {
  const { state, actions } = useAppContext();

  // Fetch candidates for a specific job
  const fetchCandidates = useCallback(async (id: string) => {
    await actions.fetchCandidates(id);
  }, [actions]);

  // Run Gemini AI screening on uploaded resumes
  const runGeminiScreening = useCallback(async (id: string, files: File[]): Promise<ScreeningResponse> => {
    return await actions.runGeminiScreening(id, files);
  }, [actions]);

  // Auto-fetch candidates when jobId changes
  useEffect(() => {
    if (jobId && !state.loading.candidates) {
      fetchCandidates(jobId);
    }
  }, [jobId, state.loading.candidates, fetchCandidates]);

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
    fetchCandidates,
    runGeminiScreening,
    clearError: actions.clearError,
  };
};

// Hook for file upload handling
export const useFileUpload = () => {
  const validateFiles = (files: File[]): { valid: boolean; error?: string } => {
    // Check if files are provided
    if (files.length === 0) {
      return { valid: false, error: 'No files selected' };
    }

    // Check file count (max 50 as per backend)
    if (files.length > 50) {
      return { valid: false, error: 'Maximum 50 files allowed' };
    }

    // Check file size (5MB limit as per backend)
    const maxSize = 5 * 1024 * 1024; // 5MB
    for (const file of files) {
      if (file.size > maxSize) {
        return { valid: false, error: `File ${file.name} is too large. Maximum size is 5MB.` };
      }
    }

    // Check file types (PDF, DOC, DOCX)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: `File ${file.name} is not a supported format. Please use PDF, DOC, or DOCX.` };
      }
    }

    return { valid: true };
  };

  return {
    validateFiles,
  };
};
