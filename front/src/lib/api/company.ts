import apiClient from '../api-client';

export const getCompanyProfile = async () => {
  const response = await apiClient.get('/company/my_company/');
  return response.data;
};

export const updateCompanyProfile = async (data: any) => {
  const response = await apiClient.patch('/company/my_company/', data);
  return response.data;
};

export const uploadLogo = async (file: File) => {
  const formData = new FormData();
  formData.append('logo', file);
  const response = await apiClient.post('/company/my_company/upload_logo/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data;
};

export const uploadBanner = async (file: File) => {
  const formData = new FormData();
  formData.append('banner', file);
  const response = await apiClient.post('/company/my_company/upload_banner/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data;
};

export const companyApi = {
  getMyCompany: getCompanyProfile,
  updateMyCompany: updateCompanyProfile,
  uploadLogo,
  uploadBanner
};
