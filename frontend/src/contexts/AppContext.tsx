"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ApiResponse } from '@/types/api';
import { AppState, AppActions } from '@/types/contexts';
import { Job } from '@/types/Job';
import { Candidate } from '@/types/Candidate';
import { AIReasoning, CandidateWithUI, ScreeningResponse } from '@/types/request';
import { jobService } from '@/services/job';
import { candidateService } from '@/services/candidate';
import { aiService } from '@/services/ai';

// Helper function to map backend Candidate to frontend CandidateWithUI
const mapCandidateToUI = (candidate: Candidate): CandidateWithUI => {
  const aiReasoning: AIReasoning = {
    strengths: candidate.aiAnalysis?.topSkills || candidate.top_skills || [],
    gaps: candidate.aiAnalysis?.gaps || candidate.gaps || [],
    recommendation: candidate.aiAnalysis?.summary || candidate.summary || "",
    insights: candidate.aiAnalysis?.reasoning || "",
    recommendations: candidate.aiAnalysis?.recommendations || [],
  };

  return {
    ...candidate,
    email: candidate.email || (candidate as any).email_address || "", // Handle potential different field names
    bio: candidate.bio || "",
    headline: candidate.headline || "",
    score: candidate.aiAnalysis?.score ?? candidate.score ?? 0,
    summary: candidate.aiAnalysis?.summary || candidate.summary || "",
    top_skills: candidate.aiAnalysis?.topSkills || candidate.top_skills || [],
    gaps: candidate.aiAnalysis?.gaps || candidate.gaps || [],
    aiReasoning,
    source: (candidate.email || (candidate as any).email_address) ? "External PDF" : "CSV Upload",
  };
};

// Initial state
const initialState: AppState = {
  jobs: [],
  selectedJobCandidates: [],
  loading: {
    jobs: false,
    candidates: false,
    screening: false,
  },
  error: null,
};

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: { jobs?: boolean; candidates?: boolean; screening?: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_JOBS'; payload: Job[] }
  | { type: 'ADD_JOB'; payload: Job }
  | { type: 'SET_CANDIDATES'; payload: CandidateWithUI[] }
  | { type: 'ADD_CANDIDATES'; payload: Candidate[] }
  | { type: 'CLEAR_ERROR' };

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          ...action.payload,
        },
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: {
          jobs: false,
          candidates: false,
          screening: false,
        },
      };
    case 'SET_JOBS':
      return {
        ...state,
        jobs: action.payload,
        loading: { ...state.loading, jobs: false },
        error: null,
      };
    case 'ADD_JOB':
      return {
        ...state,
        jobs: [action.payload, ...state.jobs],
        loading: { ...state.loading, jobs: false },
        error: null,
      };
    case 'SET_CANDIDATES':
      return {
        ...state,
        selectedJobCandidates: action.payload,
        loading: { ...state.loading, candidates: false },
        error: null,
      };
    case 'ADD_CANDIDATES':
      const newCandidatesWithUI = action.payload.map(mapCandidateToUI);
      return {
        ...state,
        selectedJobCandidates: [...state.selectedJobCandidates, ...newCandidatesWithUI],
        loading: { ...state.loading, screening: false },
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context
const AppContext = createContext<{
  state: AppState;
  actions: AppActions;
} | null>(null);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Actions
  const actions: AppActions = {
    fetchJobs: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { jobs: true } });
        const response = await jobService.getAllJobs();
        
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch jobs');
        }
        
        dispatch({ type: 'SET_JOBS', payload: response.data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch jobs' });
      }
    },

    createJob: async (job) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { jobs: true } });
        const response = await jobService.createJob(job);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create job');
        }

        dispatch({ type: 'ADD_JOB', payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create job' });
        throw error;
      }
    },

    fetchCandidates: async (jobId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { candidates: true } });
        const response = await jobService.getJobCandidates(jobId);
        
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch candidates');
        }
        
        const candidatesWithUI = response.data.map(mapCandidateToUI);
        dispatch({ type: 'SET_CANDIDATES', payload: candidatesWithUI });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch candidates' });
      }
    },

    runGeminiScreening: async (jobId: string, files: File[]) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { screening: true } });
        
        const response = await jobService.screenResumes(jobId, files);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Screening failed');
        }

        // Add new candidates to the existing list
        dispatch({ type: 'ADD_CANDIDATES', payload: response.data.candidates });
        
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Screening failed' });
        throw error;
      }
    },

    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    },
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
