import { ApiResponse } from '@/types/api';
import { apiClient } from './client';
import { AnalysisDetail, RecentAnalysis } from '@/types/request';

class AnalysisService {
  async getRecentAnalyses(): Promise<ApiResponse<RecentAnalysis[]>> {
    const response = await apiClient.get<RecentAnalysis[]>('/analyses/recent');
    return response;
  }

  async getAnalysisDetail(analysisId: string): Promise<ApiResponse<AnalysisDetail>> {
    const response = await apiClient.get<AnalysisDetail>(`/analyses/${analysisId}`);
    return response;
  }
}

export const analysisService = new AnalysisService();
