import { useJobs } from '../contexts/JobsContext';
import { useAuth } from '../contexts/AuthContext';
import { scheduleReminders } from '../utils/reminders';
import { Bell, Clock, ExternalLink, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format, addDays } from 'date-fns';

export default function RemindersPage() {
  const { jobs, updateJob, STATUS_OPTIONS } = useJobs();
  const { user } = useAuth();
  const navigate = useNavigate();

  const reminders = scheduleReminders(jobs);

  const upcoming = jobs
    .filter(j => ['applied', 'in_progress'].includes(j.status))
    .map(j => {
      const applied = new Date(j.appliedAt);
      const reminderDate = addDays(applied, j.reminderDays || 7);
      const daysLeft = Math.ceil((reminderDate - new Date()) / 86400000);
      return { ...j, reminderDate, daysLeft };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><Bell size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Reminders</h1>
          <p style={styles.subtitle}>Follow up before you're forgotten</p>
        </div>
      </div>

      {/* Active reminders */}
      {reminders.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>🔴 Action Required ({reminders.length})</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reminders.map(r => {
              const job = jobs.find(j => j.id === r.jobId);
              if (!job) return null;
              return (
                <div key={r.jobId} className="card" style={styles.reminderCard}>
                  <div style={styles.reminderLeft}>
                    <div style={styles.reminderIcon}><Bell size={16} color="#f7c96e" /></div>
                    <div>
                      <div style={styles.reminderTitle}>{r.title}</div>
                      <div style={styles.reminderCompany}>{r.company}</div>
                      <div style={styles.reminderMsg}>{r.message}</div>
                    </div>
                  </div>
                  <div style={styles.reminderActions}>
                    <select
                      value={job.status}
                      onChange={e => updateJob(r.jobId, { status: e.target.value })}
                      style={styles.statusSelect}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}
                      onClick={() => navigate(`/jobs/${r.jobId}`)}>
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Upcoming Follow-ups</h2>
        {upcoming.length === 0 ? (
          <div style={styles.empty}>
            <CheckCircle size={28} color="#43e97b" />
            <p>All caught up! No pending follow-ups.</p>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Company', 'Role', 'Applied', 'Reminder Date', 'Days Left', 'Status', ''].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcoming.map(job => (
                  <tr key={job.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={styles.avatar}>{job.company?.[0]?.toUpperCase()}</div>
                        <span style={{ fontWeight: 500, fontSize: 14 }}>{job.company}</span>
                      </div>
                    </td>
                    <td style={styles.td}><span style={{ fontSize: 13 }}>{job.title}</span></td>
                    <td style={{ ...styles.td, color: 'var(--text-2)', fontSize: 13 }}>
                      {format(new Date(job.appliedAt), 'MMM d')}
                    </td>
                    <td style={{ ...styles.td, fontSize: 13 }}>
                      {format(job.reminderDate, 'MMM d, yyyy')}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: 13,
                        color: job.daysLeft <= 0 ? '#ff6584' : job.daysLeft <= 3 ? '#f7c96e' : '#43e97b',
                      }}>
                        {job.daysLeft <= 0 ? 'OVERDUE' : `${job.daysLeft}d`}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span className={`badge badge-${job.status}`}>
                        {STATUS_OPTIONS.find(s => s.value === job.status)?.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}
                        onClick={() => navigate(`/jobs/${job.id}`)}>
                        Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email setup info */}
      <div className="card" style={styles.emailInfo}>
        <div style={styles.emailIcon}><Bell size={20} color="var(--accent)" /></div>
        <div>
          <div style={styles.emailTitle}>Email Reminders</div>
          <div style={styles.emailDesc}>
            To receive email reminders, configure your email settings in{' '}
            <button style={styles.link} onClick={() => navigate('/settings')}>Settings → Notifications</button>.
            You'll need a free EmailJS account (emailjs.com) to enable this feature.
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '28px 32px', animation: 'fadeIn 0.4s ease' },
  header: { marginBottom: 28 },
  title: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 },
  subtitle: { color: 'var(--text-2)', fontSize: 14 },
  section: { marginBottom: 28 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, marginBottom: 12 },
  reminderCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, borderColor: 'rgba(247,201,110,0.3)', padding: 16 },
  reminderLeft: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  reminderIcon: {
    width: 36, height: 36, borderRadius: 8,
    background: 'rgba(247,201,110,0.1)', border: '1px solid rgba(247,201,110,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  reminderTitle: { fontWeight: 500, fontSize: 14, marginBottom: 2 },
  reminderCompany: { fontSize: 12, color: 'var(--text-2)', marginBottom: 4 },
  reminderMsg: { fontSize: 12, color: 'var(--text-3)' },
  reminderActions: { display: 'flex', gap: 8, flexShrink: 0 },
  statusSelect: { padding: '6px 10px', fontSize: 12, width: 'auto', minWidth: 120 },
  empty: { textAlign: 'center', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--text-2)', fontSize: 14 },
  tableWrap: { borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', background: 'var(--bg-2)', color: 'var(--text-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', textAlign: 'left' },
  tr: { borderBottom: '1px solid var(--border)', transition: 'background 0.1s' },
  td: { padding: '12px 14px', verticalAlign: 'middle' },
  avatar: {
    width: 30, height: 30, background: 'rgba(108,99,255,0.1)', border: '1px solid var(--border)',
    borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 12,
  },
  emailInfo: { display: 'flex', gap: 16, alignItems: 'flex-start', marginTop: 8 },
  emailIcon: { width: 40, height: 40, background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emailTitle: { fontWeight: 600, fontSize: 14, marginBottom: 4 },
  emailDesc: { fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 },
  link: { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' },
};
