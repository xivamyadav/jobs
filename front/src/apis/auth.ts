import apiClient from '../lib/api-client';

export const loginUser = async (data: any) => {
  const response = await apiClient.post('/auth/company/login/', data);
  return response.data;
};

export const registerCompany = async (data: any) => {
  const response = await apiClient.post('/auth/company/register/', data);
  return response.data;
};

export const verifyOtp = async (data: any) => {
  // Uses verify-email but maybe backend accepts OTP in the data
  const response = await apiClient.post('/auth/company/verify-email/', data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/company/user/');
  // Backend returns { success: true, data: { id, email, ... } }
  return response.data?.data ?? response.data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await apiClient.post('/auth/company/forgot-password/', { email });
  return response.data;
};

export const confirmPasswordReset = async (email: string, otp: string, newPassword: string, confirmPassword: string) => {
  const response = await apiClient.post('/auth/company/reset-password/', { email, otp, new_password: newPassword, confirm_new_password: confirmPassword });
  return response.data;
};

export const changePassword = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
  const response = await apiClient.post('/auth/company/change-password/', { old_password: oldPassword, new_password: newPassword, confirm_new_password: confirmPassword });
  return response.data;
};
