import { useJobs } from '../contexts/JobsContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#6c63ff', '#00d2ff', '#f7c96e', '#43e97b', '#ff6584', '#7a7a9a'];

export default function StatsPage() {
  const { jobs, stats, STATUS_OPTIONS } = useJobs();

  const statusData = STATUS_OPTIONS.map((s, i) => ({
    name: s.label,
    value: jobs.filter(j => j.status === s.value).length,
    color: COLORS[i],
  })).filter(d => d.value > 0);

  const fieldData = stats.byField.slice(0, 8);
  const weeklyData = stats.byWeek;

  const avgDaysToRespond = () => {
    const responded = jobs.filter(j => ['interview', 'offer', 'rejected'].includes(j.status));
    if (!responded.length) return 'N/A';
    const avg = responded.reduce((acc, j) => {
      const days = Math.floor((new Date(j.updatedAt) - new Date(j.appliedAt)) / 86400000);
      return acc + days;
    }, 0) / responded.length;
    return `${Math.round(avg)} days`;
  };

  const topCompanyFields = fieldData[0]?.name || 'N/A';

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Analytics</h1>
        <p style={styles.subtitle}>Your job hunt performance at a glance</p>
      </div>

      {/* Key metrics */}
      <div style={styles.metricsRow}>
        {[
          { label: 'Total Applications', value: stats.total, unit: '' },
          { label: 'Response Rate', value: stats.responseRate, unit: '%' },
          { label: 'Avg. Response Time', value: avgDaysToRespond(), unit: '' },
          { label: 'Interviews', value: stats.interview, unit: '' },
          { label: 'Offers', value: stats.offer, unit: '' },
          { label: 'Top Field', value: topCompanyFields, unit: '' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="card" style={styles.metricCard}>
            <div style={styles.metricValue}>{value}{unit}</div>
            <div style={styles.metricLabel}>{label}</div>
          </div>
        ))}
      </div>

      <div style={styles.chartsGrid}>
        {/* Status Pie */}
        <div className="card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Applications by Status</h3>
          {statusData.length === 0 ? (
            <div style={styles.noData}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weekly applications */}
        <div className="card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Applications per Week</h3>
          {weeklyData.length === 0 ? (
            <div style={styles.noData}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fill: 'var(--text-3)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By field */}
        <div className="card" style={{ ...styles.chartCard, gridColumn: '1 / -1' }}>
          <h3 style={styles.chartTitle}>Applications by Field</h3>
          {fieldData.length === 0 ? (
            <div style={styles.noData}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fieldData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-3)', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fill: 'var(--text-2)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#00d2ff" radius={[0, 4, 4, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Status table */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ ...styles.chartTitle, marginBottom: 16 }}>Detailed Breakdown</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Status', 'Count', 'Percentage', 'Progress'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STATUS_OPTIONS.map((s, i) => {
              const count = jobs.filter(j => j.status === s.value).length;
              const pct = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0.0';
              return (
                <tr key={s.value} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={styles.td}>
                    <span className={`badge badge-${s.value}`}>
                      <span className="dot" style={{ background: s.color }} />
                      {s.label}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{count}</td>
                  <td style={{ ...styles.td, color: 'var(--text-2)' }}>{pct}%</td>
                  <td style={{ ...styles.td, width: '40%' }}>
                    <div style={{ background: 'var(--bg-3)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: COLORS[i], borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '28px 32px', animation: 'fadeIn 0.4s ease' },
  header: { marginBottom: 24 },
  title: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 },
  subtitle: { color: 'var(--text-2)', fontSize: 14 },
  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 },
  metricCard: { textAlign: 'center', padding: 16 },
  metricValue: { fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 },
  metricLabel: { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  chartCard: { padding: 20 },
  chartTitle: { fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 16 },
  noData: { height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 },
  th: { padding: '10px 14px', textAlign: 'left', color: 'var(--text-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' },
  td: { padding: '12px 14px', fontSize: 13, verticalAlign: 'middle' },
};
