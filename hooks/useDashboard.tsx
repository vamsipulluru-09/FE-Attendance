"use client"

import { useState, useEffect } from 'react';
import AttendanceAPI, { 
  AttendanceSummary, 
  Activity, 
  Employee, 
  Branch 
} from './attendanceAPI';
import { useBranches } from '@/hooks/useGetBranches';

export const useAttendanceSummary = () => {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await AttendanceAPI.getTodayAttendanceSummary();
        setSummary(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch attendance summary');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return { summary, loading, error };
};

export const useRecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await AttendanceAPI.getRecentActivities();
        setActivities(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch recent activities');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return { activities, loading, error };
};

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await AttendanceAPI.getEmployees();
        setEmployees(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch employees');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return { employees, loading, error };
};

export const useGetBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const { branches } = await useBranches();
        setBranches(branches);
        setError(null);
      } catch (err) {
        setError('Failed to fetch branches');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  return { branches, loading, error };
};

export const useAttendanceReport = (startDate?: string, endDate?: string) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await AttendanceAPI.getAttendanceReport(startDate, endDate);
        setReport(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch attendance report');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [startDate, endDate]);

  return { report, loading, error };
};