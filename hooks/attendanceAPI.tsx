import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Employee {
  entity_id: string;
  name: string;
  branch_id: number;
  branch_name: string;
  created_at: string;
}

export interface Branch {
  branch_id: number;
  branch_name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface AttendanceRecord {
  entity_id: string;
  event_type: 'checkin' | 'checkout';
  event_time: string;
  latitude: number;
  longitude: number;
}

export interface DailyAttendance {
  date: string;
  count: number;
  percentage: number;
}

export interface AttendanceSummary {
  count: number;
  percentage: number;
  weeklyAverage: number;
}

export interface Activity {
  id: string;
  type: string;
  color: string;
  description: string;
  timestamp: string;
  timeFormatted: string;
}

// API functions
export const AttendanceAPI = {
  // Get today's attendance summary
  getTodayAttendanceSummary: async (): Promise<AttendanceSummary> => {
    const response = await apiClient.get('/attendance/today/summary');
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (): Promise<Activity[]> => {
    const response = await apiClient.get('/attendance/recent-activity');
    return response.data.activities;
  },

  // Get all employees
  getEmployees: async (): Promise<Employee[]> => {
    const response = await apiClient.get('/employees');
    return response.data.employees;
  },

  // Get attendance for a specific employee
  getEmployeeAttendance: async (entityId: string) => {
    const response = await apiClient.get(`/user-report/${entityId}`);
    return response.data.attendance_records;
  },

  // Get attendance report for date range
  getAttendanceReport: async (startDate?: string, endDate?: string) => {
    let url = '/attendance/report';
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await apiClient.get(url);
    return response.data;
  },

};

export default AttendanceAPI;