import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  email: string;
  role: 'mentor' | 'mentee';
  name?: string;
  bio?: string;
  tech_stack?: string[];
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MatchRequest {
  id: number;
  mentee_id: number;
  mentor_id: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  mentor_name?: string;
  mentee_name?: string;
  mentor_tech_stack?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Auth API
export const authAPI = {
  signup: async (userData: {
    email: string;
    password: string;
    role: 'mentor' | 'mentee';
    name?: string;
    bio?: string;
    tech_stack?: string[];
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (profileData: {
    name?: string;
    bio?: string;
    tech_stack?: string[];
  }): Promise<User> => {
    const response = await api.put('/users/me', profileData);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('avatar', file);
    await api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getMentors: async (filters?: {
    techStack?: string;
    sortBy?: string;
  }): Promise<User[]> => {
    const params = new URLSearchParams();
    if (filters?.techStack) params.append('techStack', filters.techStack);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    
    const response = await api.get(`/users/mentors?${params.toString()}`);
    return response.data;
  },
};

// Match API
export const matchAPI = {
  createRequest: async (requestData: {
    mentor_id: number;
    message?: string;
  }): Promise<MatchRequest> => {
    const response = await api.post('/matches/requests', requestData);
    return response.data;
  },

  getMyRequests: async (): Promise<MatchRequest[]> => {
    const response = await api.get('/matches/my-requests');
    return response.data;
  },

  updateRequestStatus: async (
    requestId: number,
    status: 'accepted' | 'rejected'
  ): Promise<MatchRequest> => {
    const response = await api.put(`/matches/requests/${requestId}/status`, {
      status,
    });
    return response.data;
  },

  deleteRequest: async (requestId: number): Promise<void> => {
    await api.delete(`/matches/requests/${requestId}`);
  },
};

export default api;
