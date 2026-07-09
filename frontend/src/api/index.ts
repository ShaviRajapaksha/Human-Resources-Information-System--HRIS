import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hris_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { email: string; password: string; role?: string }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentEmployees: () => api.get('/dashboard/recent-employees'),
  getDepartmentHeadcount: () => api.get('/dashboard/department-headcount'),
  getLeaveStats: () => api.get('/dashboard/leave-stats'),
  getPayrollTrend: () => api.get('/dashboard/payroll-trend'),
};

// Employees
export const employeesApi = {
  getAll: (search?: string, departmentId?: number) =>
    api.get('/employees', { params: { search, departmentId } }),
  getOne: (id: number) => api.get(`/employees/${id}`),
  create: (data: any) => api.post('/employees', data),
  update: (id: number, data: any) => api.put(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
};

// Departments
export const departmentsApi = {
  getAll: () => api.get('/departments'),
  getOne: (id: number) => api.get(`/departments/${id}`),
  create: (data: any) => api.post('/departments', data),
  update: (id: number, data: any) => api.put(`/departments/${id}`, data),
  delete: (id: number) => api.delete(`/departments/${id}`),
};

// Leaves
export const leavesApi = {
  getAll: (employeeId?: number, status?: string) =>
    api.get('/leaves', { params: { employeeId, status } }),
  getOne: (id: number) => api.get(`/leaves/${id}`),
  create: (data: any) => api.post('/leaves', data),
  updateStatus: (id: number, status: string) => api.put(`/leaves/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/leaves/${id}`),
};

// Attendance
export const attendanceApi = {
  getAll: (employeeId?: number, date?: string) =>
    api.get('/attendance', { params: { employeeId, date } }),
  getTodaySummary: () => api.get('/attendance/today-summary'),
  create: (data: any) => api.post('/attendance', data),
  update: (id: number, data: any) => api.put(`/attendance/${id}`, data),
  delete: (id: number) => api.delete(`/attendance/${id}`),
};

// Payroll
export const payrollApi = {
  getAll: (params?: { employeeId?: number; month?: number; year?: number }) =>
    api.get('/payroll', { params }),
  getOne: (id: number) => api.get(`/payroll/${id}`),
  getSummary: (month: number, year: number) =>
    api.get('/payroll/summary', { params: { month, year } }),
  create: (data: any) => api.post('/payroll', data),
  updateStatus: (id: number, status: string) => api.put(`/payroll/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/payroll/${id}`),
};
