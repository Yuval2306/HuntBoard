import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';

const JobsContext = createContext(null);

export const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied', color: '#a89cff' },
  { value: 'in_progress', label: 'In Progress', color: '#00d2ff' },
  { value: 'interview', label: 'Interview', color: '#f7c96e' },
  { value: 'offer', label: 'Offer', color: '#43e97b' },
  { value: 'rejected', label: 'Rejected', color: '#ff6584' },
  { value: 'ghosted', label: 'Ghosted', color: '#7a7a9a' },
];

export const FIELDS = [
  'Software Development', 'Information Systems', 'IT / Infra', 'Data Engineering',
  'Machine Learning / AI', 'DevOps / Cloud', 'Cybersecurity', 'QA / Testing',
  'Frontend', 'Backend', 'Full Stack', 'Mobile', 'Other'
];

const EMPTY_STATS = {
  total: 0, applied: 0, inProgress: 0, interview: 0,
  offer: 0, rejected: 0, ghosted: 0, responseRate: 0,
  byField: [], byWeek: [],
};

export function JobsProvider({ children }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async (params) => {
    setLoading(true);
    try {
      const data = await api.getJobs(params || {});
      setJobs(data.jobs);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchStats();
    } else {
      setJobs([]);
      setStats(EMPTY_STATS);
    }
  }, [user]);

  const addJob = async (jobData) => {
    const data = await api.createJob(jobData);
    setJobs(prev => [data.job, ...prev]);
    fetchStats();
    return data.job;
  };

  const updateJob = async (id, updates) => {
    const data = await api.updateJob(id, updates);
    setJobs(prev => prev.map(j => (j._id === id ? { ...j, ...data.job } : j)));
    fetchStats();
    return data.job;
  };

  const deleteJob = async (id) => {
    await api.deleteJob(id);
    setJobs(prev => prev.filter(j => j._id !== id));
    fetchStats();
  };

  const deleteAllJobs = async () => {
    await api.deleteAllJobs();
    setJobs([]);
    setStats(EMPTY_STATS);
  };

  const getJob = (id) => jobs.find(j => j._id === id);

  return (
    <JobsContext.Provider value={{
      jobs, stats, loading,
      addJob, updateJob, deleteJob, deleteAllJobs,
      getJob, fetchJobs, fetchStats,
      STATUS_OPTIONS, FIELDS,
    }}>
      {children}
    </JobsContext.Provider>
  );
}

export const useJobs = () => useContext(JobsContext);
