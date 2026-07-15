import api from './api';
import type {
  User,
  Attendance,
  Schedule,
  LeaveRequest,
  Holiday,
  CompanyLocation,
  Division,
  Position,
  Shift,
  Pagination,
  EmployeeFilter,
  DailyReport,
} from '../types';

// ============ EMPLOYEE ============
export const employeeApi = {
  list: (filter?: EmployeeFilter) =>
    api.get<{ success: boolean; data: { employees: User[]; pagination: Pagination } }>('/employees', { params: filter }),
  getById: (id: string) => api.get<{ data: User }>(`/employees/${id}`),
  create: (data: any) => api.post('/employees', data),
  update: (id: string, data: any) => api.put(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
  restore: (id: string) => api.put(`/employees/${id}/restore`),
  changePassword: (id: string, newPassword: string) =>
    api.put(`/employees/${id}/change-password`, { newPassword }),
};

// ============ DIVISION ============
export const divisionApi = {
  list: () => api.get<{ data: Division[] }>('/employees/divisions/list'),
  create: (data: { nama: string; description?: string }) => api.post('/employees/divisions', data),
  update: (id: string, data: any) => api.put(`/employees/divisions/${id}`, data),
  delete: (id: string) => api.delete(`/employees/divisions/${id}`),
};

// ============ POSITION ============
export const positionApi = {
  list: () => api.get<{ data: Position[] }>('/employees/positions/list'),
  create: (data: { nama: string; description?: string; level?: number }) =>
    api.post('/employees/positions', data),
  update: (id: string, data: any) => api.put(`/employees/positions/${id}`, data),
  delete: (id: string) => api.delete(`/employees/positions/${id}`),
};

// ============ SHIFT ============
export const shiftApi = {
  list: () => api.get<{ data: Shift[] }>('/employees/shifts/list'),
  create: (data: { nama: string; jamMulai: string; jamSelesai: string; toleransiMenit?: number }) =>
    api.post('/employees/shifts', data),
  update: (id: string, data: any) => api.put(`/employees/shifts/${id}`, data),
  delete: (id: string) => api.delete(`/employees/shifts/${id}`),
};

// ============ SCHEDULE ============
export const scheduleApi = {
  list: (userId?: string, hari?: number) =>
    api.get<{ data: Schedule[] }>('/admin/schedules', { params: { userId, hari } }),
  create: (data: { userId: string; hari: number; jamMulai: string; jamSelesai: string; shiftType?: string; toleransiMenit?: number }) =>
    api.post('/admin/schedule', data),
  update: (id: string, data: any) => api.put(`/admin/schedule/${id}`, data),
  delete: (id: string) => api.delete(`/admin/schedule/${id}`),
  bulkAssign: (data: { userIds: string[]; hari: number; jamMulai: string; jamSelesai: string; shiftType?: string; toleransiMenit?: number }) =>
    api.post('/admin/schedule/bulk', data),
  importPreview: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/schedule/import/preview', formData);
  },
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/schedule/import', formData);
  },
};

// ============ HOLIDAY ============
export const holidayApi = {
  list: () => api.get<{ data: Holiday[] }>('/admin/holidays'),
  create: (data: { nama: string; tanggal: string }) => api.post('/admin/holiday', data),
  delete: (id: string) => api.delete(`/admin/holiday/${id}`),
};

// ============ ATTENDANCE ============
export const attendanceApi = {
  list: (startDate?: string, endDate?: string) =>
    api.get<{ data: Attendance[] }>('/admin/attendance', { params: { startDate, endDate } }),
};

// ============ LEAVE ============
export const leaveApi = {
  list: (status?: string) =>
    api.get<{ data: LeaveRequest[] }>('/admin/leave-requests', { params: { status } }),
  approve: (id: string, catatanAdmin?: string) =>
    api.put(`/admin/leave-request/${id}/approve`, { catatanAdmin }),
  reject: (id: string, catatanAdmin?: string) =>
    api.put(`/admin/leave-request/${id}/reject`, { catatanAdmin }),
};

// ============ REPORTS ============
export const reportApi = {
  daily: (date?: string) =>
    api.get<{ data: DailyReport }>('/admin/reports/daily', { params: { date } }),
  weekly: (startDate?: string, endDate?: string) =>
    api.get('/admin/reports/weekly', { params: { startDate, endDate } }),
  monthly: (month?: number, year?: number) =>
    api.get('/admin/reports/monthly', { params: { month, year } }),
  employee: (userId: string, startDate?: string, endDate?: string) =>
    api.get('/admin/reports/employee', { params: { userId, startDate, endDate } }),
  leave: (startDate?: string, endDate?: string) =>
    api.get('/admin/reports/leave', { params: { startDate, endDate } }),
  export: (params: Record<string, string>) =>
    api.get('/admin/reports/export', { params, responseType: 'blob' }),
};

// ============ COMPANY LOCATION ============
export const locationApi = {
  get: () => api.get<{ data: CompanyLocation }>('/admin/company-location'),
  set: (data: { nama: string; latitude: number; longitude: number; radius?: number }) =>
    api.post('/admin/company-location', data),
};

// ============ SETTINGS ============
export const settingsApi = {
  getAll: () => api.get<{ data: Record<string, string> }>('/settings'),
  getCompanyProfile: () => api.get<{ data: { name: string; address: string; phone: string; email: string } }>('/settings/company-profile'),
  setCompanyProfile: (data: { name?: string; address?: string; phone?: string; email?: string }) =>
    api.put('/settings/company-profile', data),
  getWorkTime: () => api.get<{ data: { workStart: string; workEnd: string; toleranceMinutes: number } }>('/settings/work-time'),
  setWorkTime: (data: { workStart?: string; workEnd?: string; toleranceMinutes?: number }) =>
    api.put('/settings/work-time', data),
  getSmtp: () => api.get<{ data: { host: string; port: string; user: string; pass: string; from: string } }>('/settings/smtp'),
  setSmtp: (data: { host?: string; port?: string; user?: string; pass?: string; from?: string }) =>
    api.put('/settings/smtp', data),
  getLogo: () => api.get<{ data: { logo: string } }>('/settings/logo'),
  setLogo: (logo: string) => api.put('/settings/logo', { logo }),
};

// ============ DASHBOARD ============
export const dashboardApi = {
  get: () => api.get('/admin/dashboard'),
};
