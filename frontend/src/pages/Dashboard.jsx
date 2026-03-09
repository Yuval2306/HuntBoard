import { useJobs } from '../contexts/JobsContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Plus, Clock, CheckCircle2, XCircle, AlertCircle, MessageSquare, Zap } from 'lucide-react';
import { fetchLeetCodeQuestion } from '../utils/gemini';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { jobs, stats, STATUS_OPTIONS } = useJobs();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leetcode, setLeetcode] = useState(null);

  useEffect(() => {
    fetchLeetCodeQuestion().then(setLeetcode);
  }, []);

  const statCards = [
    { label: 'Total Applied', value: stats.total, icon: Zap, color: '#6c63ff', bg: 'rgba(108,99,255,0.1)' },
    { label: 'In Progress', value: stats.inProgress + stats.interview, icon: Clock, color: '#00d2ff', bg: 'rgba(0,210,255,0.1)' },
    { label: 'Offers', value: stats.offer, icon: CheckCircle2, color: '#43e97b', bg: 'rgba(67,233,123,0.1)' },
    { label: 'Response Rate', value: `${stats.responseRate}%`, icon: TrendingUp, color: '#f7c96e', bg: 'rgba(247,201,110,0.1)' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: '#ff6584', bg: 'rgba(255,101,132,0.1)' },
    { label: 'Ghosted', value: stats.ghosted, icon: MessageSquare, color: '#7a7a9a', bg: 'rgba(122,122,154,0.1)' },
  ];

  const recentJobs = jobs.slice(0, 5);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Good {getGreeting()}, <span style={{ color: 'var(--accent)' }}>{user?.username}</span> 👋
          </h1>
          <p style={styles.subtitle}>Here's your job hunt overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/jobs?new=1')}>
          <Plus size={16} /> Add Application
        </button>
      </div>

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: bg }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ ...styles.statValue, color }}>{value}</div>
            <div style={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      <div style={styles.bottom}>
        {/* Recent Applications */}
        <div style={styles.recentSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Applications</h2>
            <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/jobs')}>
              View all →
            </button>
          </div>

          {recentJobs.length === 0 ? (
            <div style={styles.empty}>
              <Zap size={28} color="var(--text-3)" />
              <p>No applications yet</p>
              <button className="btn btn-primary" onClick={() => navigate('/jobs?new=1')}>
                <Plus size={14} /> Add your first
              </button>
            </div>
          ) : (
            <div style={styles.jobList}>
              {recentJobs.map(job => (
                <div key={job.id} className="card" style={styles.jobRow}
                  onClick={() => navigate(`/jobs/${job.id}`)}>
                  <div style={styles.jobLeft}>
                    <div style={styles.companyAvatar}>
                      {job.company?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={styles.jobTitle}>{job.title || 'Untitled'}</div>
                      <div style={styles.jobCompany}>{job.company} · {job.field}</div>
                    </div>
                  </div>
                  <div style={styles.jobRight}>
                    <span className={`badge badge-${job.status}`}>
                      <span className="dot" style={{ background: STATUS_OPTIONS.find(s => s.value === job.status)?.color }} />
                      {STATUS_OPTIONS.find(s => s.value === job.status)?.label}
                    </span>
                    <span style={styles.timeAgo}>
                      {formatDistanceToNow(new Date(job.appliedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LeetCode widget */}
        <div style={styles.leetcodeSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Daily LeetCode</h2>
          </div>
          {leetcode ? (
            <div className="card" style={styles.leetcodeCard}>
              <div style={styles.lcHeader}>
                <span style={styles.lcId}>#{leetcode.id}</span>
                <span style={{
                  ...styles.lcDiff,
                  color: leetcode.difficulty === 'Easy' ? '#43e97b' : leetcode.difficulty === 'Medium' ? '#f7c96e' : '#ff6584',
                  background: leetcode.difficulty === 'Easy' ? 'rgba(67,233,123,0.1)' : leetcode.difficulty === 'Medium' ? 'rgba(247,201,110,0.1)' : 'rgba(255,101,132,0.1)',
                }}>
                  {leetcode.difficulty}
                </span>
              </div>
              <div style={styles.lcTitle}>{leetcode.title}</div>
              <div style={styles.lcTags}>
                {leetcode.tags?.map(t => (
                  <span key={t} style={styles.lcTag}>{t}</span>
                ))}
              </div>
              <a href={`https://leetcode.com/problems/${leetcode.slug}`} target="_blank" rel="noreferrer"
                className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                Solve Problem →
              </a>
            </div>
          ) : (
            <div className="card" style={styles.lcLoading}>Loading...</div>
          )}

          {/* Status breakdown */}
          <div style={styles.breakdown}>
            <div style={styles.sectionHeader}>
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>Status Breakdown</h3>
            </div>
            {STATUS_OPTIONS.map(s => {
              const count = jobs.filter(j => j.status === s.value).length;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={s.value} style={styles.breakdownRow}>
                  <span style={{ ...styles.breakdownLabel, color: s.color }}>{s.label}</span>
                  <div style={styles.breakdownBar}>
                    <div style={{ ...styles.breakdownFill, width: `${pct}%`, background: s.color }} />
                  </div>
                  <span style={styles.breakdownCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = {
  page: { padding: '28px 32px', maxWidth: 1100, margin: '0 auto', animation: 'fadeIn 0.4s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 },
  subtitle: { color: 'var(--text-2)', fontSize: 14 },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 12,
    marginBottom: 28,
  },
  statCard: { display: 'flex', flexDirection: 'column', gap: 6, padding: 16, cursor: 'default' },
  statIcon: { width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 12, color: 'var(--text-2)', fontWeight: 500 },
  bottom: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' },
  recentSection: {},
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600 },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    padding: '40px 20px', color: 'var(--text-3)',
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
    fontSize: 14,
  },
  jobList: { display: 'flex', flexDirection: 'column', gap: 8 },
  jobRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: 14 },
  jobLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  companyAvatar: {
    width: 38, height: 38,
    background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,101,132,0.2))',
    border: '1px solid var(--border)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 15,
    color: 'var(--text)',
    flexShrink: 0,
  },
  jobTitle: { fontWeight: 500, fontSize: 14, marginBottom: 2 },
  jobCompany: { fontSize: 12, color: 'var(--text-2)' },
  jobRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  timeAgo: { fontSize: 11, color: 'var(--text-3)' },
  leetcodeSection: { display: 'flex', flexDirection: 'column', gap: 12 },
  leetcodeCard: { padding: 16 },
  lcHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  lcId: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' },
  lcDiff: { padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
  lcTitle: { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, marginBottom: 8 },
  lcTags: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  lcTag: {
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    padding: '2px 8px', borderRadius: 20, fontSize: 11, color: 'var(--text-2)',
  },
  lcLoading: { padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 },
  breakdown: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 },
  breakdownRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  breakdownLabel: { width: 80, fontSize: 12, fontWeight: 500 },
  breakdownBar: { flex: 1, height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' },
  breakdownFill: { height: '100%', borderRadius: 3, transition: 'width 0.5s ease' },
  breakdownCount: { width: 20, textAlign: 'right', fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' },
};
