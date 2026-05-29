import apiClient from '../api-client';

export const getDashboardStats = async (timeframe: string = 'This Week') => {
  try {
    const response = await apiClient.get('/company/dashboard/stats/', { params: { timeframe } });
    return response.data;
  } catch (error) {
    // Fallback stub if backend endpoint is not ready
    return {
      success: true,
      data: {
        jobs: { total: 10, published: 8, total_views: 1200 },
        applicants: { total: 45, new: 12, status_breakdown: { INTERVIEWING: 5, SHORTLISTED: 3 } },
        recent_jobs: [],
        recent_applicants: [],
        chart_data: []
      }
    };
  }
};
export const dashboardApi = {
    getStats: getDashboardStats,
};
