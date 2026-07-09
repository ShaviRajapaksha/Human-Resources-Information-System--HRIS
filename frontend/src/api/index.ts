import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('hris_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
})

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('hris_token');
            localStorage.removeItem('hris_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

//Auth
export const authApi = {
    login: (data: { email: string; password: string }) => api.post('/auth/login', data),
    register: (data: { email: string; password: string; role?: string }) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/profile'),
}