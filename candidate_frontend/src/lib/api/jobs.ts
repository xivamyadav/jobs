import { jobsApi } from '@/apis/user';

export const getActiveJobs = async () => {
  return await jobsApi.getJobs();
};

export const getJobById = async (id: number) => {
  return await jobsApi.getJobDetail(id);
};

export const getSavedJobs = async () => {
  return await jobsApi.getSavedJobs();
};

export const saveJob = async (jobId: number) => {
  return await jobsApi.saveJob(jobId);
};

export const unsaveJob = async (jobId: number) => {
  return await jobsApi.unsaveJob(jobId);
};

export const applyJob = async (jobId: number, data?: any) => {
  return await jobsApi.applyJob(jobId, data);
};

export const getApplications = async () => {
  return await jobsApi.getApplications();
};

export const getRecommendedJobs = async (userSkills: string[] = []) => {
  return await jobsApi.getJobs();
};
