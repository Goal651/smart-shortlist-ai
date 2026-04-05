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
    strengths: candidate.top_skills,
    gaps: candidate.gaps,
    recommendation: candidate.summary,
  };

  return {
    ...candidate,
    aiReasoning,
    source: candidate.email ? "External PDF" : "CSV Upload", // Simple source detection
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
        const response = await fetch(`${API_BASE_URL}/jobs`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.statusText}`);
        }
        
        const jobs: Job[] = await response.json();
        dispatch({ type: 'SET_JOBS', payload: jobs });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch jobs' });
      }
    },

    createJob: async (job) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { jobs: true } });
        const response = await fetch(`${API_BASE_URL}/jobs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(job),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to create job: ${response.statusText}`);
        }

        const newJob: Job = await response.json();
        dispatch({ type: 'ADD_JOB', payload: newJob });
        return newJob;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create job' });
        throw error;
      }
    },

    fetchCandidates: async (jobId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { candidates: true } });
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/candidates`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch candidates: ${response.statusText}`);
        }
        
        const candidates: Candidate[] = await response.json();
        const candidatesWithUI = candidates.map(mapCandidateToUI);
        dispatch({ type: 'SET_CANDIDATES', payload: candidatesWithUI });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch candidates' });
      }
    },

    runGeminiScreening: async (jobId: string, files: File[]) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { screening: true } });
        
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('resumes', file);
        });

        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/screen`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Screening failed: ${response.statusText}`);
        }

        const screeningResult: ScreeningResponse = await response.json();
        
        // Add new candidates to the existing list
        dispatch({ type: 'ADD_CANDIDATES', payload: screeningResult.candidates });
        
        return screeningResult;
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
