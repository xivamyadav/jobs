import axios from "axios";
import { API_BASE_URL } from "./api-config";
import Cookies from "js-cookie";

export type Skill = { id: number; name: string };

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = Cookies.get("access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const ACCOUNT_PATH = "/api/v1/auth/candidate";
const CANDIDATE_PATH = "/api/v1/candidate";

const getError = (error: any, fallback: string) => {
    const data = error?.response?.data;
    if (data) throw new Error(JSON.stringify(data));
    throw new Error(error?.message || fallback);
};

export const accountApi = {
    async signup(data: any) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/register/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to signup");
        }
    },
    async login(data: any) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/login/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to login");
        }
    },
    async verifyEmail(token: string) {
        try {
            const res = await api.get(`${ACCOUNT_PATH}/verify-email/`, { params: { token } });
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to verify email");
        }
    },
    async resendVerification(data: { email: string }) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/resend-otp/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to resend OTP");
        }
    },
    async forgotPassword(data: { email: string }) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/forgot-password/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to send forgot password OTP");
        }
    },
    async verifyOTP(data: { email: string; otp: string }) {
        try {
            // Using forgot-password/ — update if backend exposes a dedicated route.
            const res = await api.post(`${ACCOUNT_PATH}/forgot-password/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to verify OTP");
        }
    },
    async resetPassword(data: any) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/reset-password/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to reset password");
        }
    },
    async changePassword(data: {
        current_password: string;
        new_password: string;
        confirm_password: string;
    }) {
        // Using reset-password/ as closest match — update if backend adds this route.
        const res = await api.post(`${ACCOUNT_PATH}/reset-password/`, {
            old_password: data.current_password,
            new_password: data.new_password,
            confirm_new_password: data.confirm_password,
        });
        return res.data;
    },
};

export const fetchLogin = accountApi.login;
export const fetchSignup = accountApi.signup;
export const fetchForgotPassword = accountApi.forgotPassword;
export const fetchVerifyOTP = accountApi.verifyOTP;
export const fetchResetPassword = accountApi.resetPassword;

export const candidateApi = {
    // ── Profile ───────────────────────────────
    async getProfile() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/profile/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch candidate profile");
        }
    },
    async updateProfile(data: any) {
        try {
            const res = await api.put(`${CANDIDATE_PATH}/profile/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to update candidate profile");
        }
    },

    // ── Education ───────────────────────────────
    async getEducations() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/education/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch education details");
        }
    },
    async createEducation(data: any) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/education/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to create education record");
        }
    },
    async updateEducation(id: number | string, data: any) {
        try {
            const res = await api.put(`${CANDIDATE_PATH}/education/${id}/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to update education record");
        }
    },
    async deleteEducation(id: number | string) {
        try {
            const res = await api.delete(`${CANDIDATE_PATH}/education/${id}/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to delete education record");
        }
    },

    // ── Experience ───────────────────────────────
    async getExperiences() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/experience/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch experience details");
        }
    },
    async createExperience(data: any) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/experience/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to create experience record");
        }
    },
    async updateExperience(id: number | string, data: any) {
        try {
            const res = await api.put(`${CANDIDATE_PATH}/experience/${id}/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to update experience record");
        }
    },
    async deleteExperience(id: number | string) {
        try {
            const res = await api.delete(`${CANDIDATE_PATH}/experience/${id}/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to delete experience record");
        }
    },

    // ── Skills ───────────────────────────────────
    async searchSkills(query: string): Promise<Skill[]> {
        const res = await api.get(`/api/v1/skills/search/`, { params: { q: query } });
        return res.data.map((s: { skill_id: number; skill_name: string }) => ({
            id: s.skill_id,
            name: s.skill_name,
        }));
    },
    async getSkills() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/skills/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch skills");
        }
    },
    async addSkill(data: any) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/skills/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to add skill");
        }
    },
    async updateSkill(id: number | string, data: any) {
        try {
            const res = await api.put(`${CANDIDATE_PATH}/skills/${id}/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to update skill");
        }
    },
    async deleteSkill(id: number | string) {
        try {
            const res = await api.delete(`${CANDIDATE_PATH}/skills/${id}/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to delete skill");
        }
    },

    // ── Resume ───────────────────────────────────
    async getResumes() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/resume/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch resumes");
        }
    },
    async uploadResume(data: FormData) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/resume/`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to upload resume");
        }
    },
    async setResumeActive(id: number | string) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/resume/${id}/set-active/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to set resume as active");
        }
    },
    async deleteResume() {
        try {
            const res = await api.delete(`${CANDIDATE_PATH}/resume/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to delete resume");
        }
    },

    // ── Company ──────────────────────────────────
    async searchCompanies(query: string) {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/companies/search/`, { params: { q: query } });
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to search companies");
        }
    },

    // ── Location ─────────────────────────────────
    async searchLocations(query: string) {
        try {
            const res = await api.get(`/api/v1/locations/search/`, { params: { q: query } });
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to search locations");
        }
    },
    async getCountries(query: string = "") {
        return (await api.get(`/api/v1/countries/`, { params: { q: query } })).data;
    },
    async getStates(query: string = "") {
        return (await api.get(`/api/v1/states/search/`, { params: { q: query } })).data;
    },
    async getCities(query: string = "") {
        return (await api.get(`/api/v1/city-search/`, { params: { q: query } })).data;
    },
};

export const jobsApi = {
    async getJobs() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/jobs/browse/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch jobs");
        }
    },
    async getJobDetail(pk: number) {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/jobs/${pk}/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch job detail");
        }
    },
    async saveJob(pk: number) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/jobs/${pk}/save/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to save job");
        }
    },
    async applyJob(pk: number, data?: any) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/jobs/${pk}/apply/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to apply for job");
        }
    },
    async getSavedJobs() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/jobs/saved/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch saved jobs");
        }
    },
    async getApplications() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/applications/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch applications");
        }
    },
    async getApplicationDetail(pk: number) {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/applications/${pk}/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch application detail");
        }
    },
};