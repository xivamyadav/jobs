import apiClient from '../lib/api-client';

export const getCompanyJobs = async (params?: Record<string, any>) => {
  const response = await apiClient.get('/jobs/', { params });
  return response.data;
};

export const getJobDetails = async (id: string) => {
  const response = await apiClient.get(`/jobs/${id}/`);
  return response.data;
};

export const createJob = async (data: any) => {
  const response = await apiClient.post('/jobs/', data);
  return response.data;
};

export const updateJob = async (id: string, data: any) => {
  const response = await apiClient.patch(`/jobs/${id}/`, data);
  return response.data;
};

export const getJobApplicants = async (jobId: string) => {
  const response = await apiClient.get(`/jobs/${jobId}/applicants/`);
  return response.data;
};

export const pauseJob = async (id: string) => {
  const response = await apiClient.patch(`/jobs/${id}/`, { status: 'paused' });
  return response.data;
};

export const publishJob = async (id: string) => {
  const response = await apiClient.patch(`/jobs/${id}/`, { status: 'published' });
  return response.data;
};

export const deleteJob = async (id: string) => {
  const response = await apiClient.delete(`/jobs/${id}/`);
  return response.data;
};

export const getJobDetail = getJobDetails;
