import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useJobs } from '../contexts/JobsContext';
import AddJobModal from '../components/AddJobModal';
import { Plus, Search, Filter, ExternalLink, Trash2, Edit3, Upload } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function JobsPage() {
  const { jobs, updateJob, deleteJob, STATUS_OPTIONS, FIELDS } = useJobs();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showAdd, setShowAdd] = useState(searchParams.get('new') === '1');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterField, setFilterField] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedJob, setSelectedJob] = useState(null);

  const filtered = jobs
    .filter(j => {
      const q = search.toLowerCase();
      const matchSearch = !q || j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || j.status === filterStatus;
      const matchField = filterField === 'all' || j.field === filterField;
      return matchSearch && matchStatus && matchField;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.appliedAt) - new Date(a.appliedAt);
      if (sortBy === 'company') return a.company?.localeCompare(b.company);
      if (sortBy === 'title') return a.title?.localeCompare(b.title);
      return 0;
    });

  const handleStatusChange = (id, status) => {
    updateJob(id, { status });
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (confirm('Delete this application?')) deleteJob(id);
  };

  const handleCVUpload = (id, e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateJob(id, { cvFileName: file.name, cvData: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.page}>
      {showAdd && <AddJobModal onClose={() => setShowAdd(false)} />}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Applications</h1>
          <p style={styles.subtitle}>{jobs.length} total · {filtered.length} shown</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Application
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.searchWrap}>
          <Search size={14} style={styles.searchIcon} />
          <input
            placeholder="Search by title or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={styles.filterSelect}>
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <select value={filterField} onChange={e => setFilterField(e.target.value)} style={styles.filterSelect}>
          <option value="all">All Fields</option>
          {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={styles.filterSelect}>
          <option value="date">Sort: Date</option>
          <option value="company">Sort: Company</option>
          <option value="title">Sort: Title</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ color: 'var(--text-3)' }}>No applications found</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add Application
          </button>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Company', 'Role', 'Field', 'Location', 'Applied', 'Status', 'CV', 'Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => (
                <tr key={job.id} style={styles.tr} onClick={() => navigate(`/jobs/${job.id}`)}>
                  <td style={styles.td}>
                    <div style={styles.companyCell}>
                      <div style={styles.avatar}>{job.company?.[0]?.toUpperCase() || '?'}</div>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{job.company || '—'}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{job.title || '—'}</div>
                    {job.salary && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{job.salary}</div>}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.fieldBadge}>{job.field || '—'}</span>
                  </td>
                  <td style={{ ...styles.td, color: 'var(--text-2)', fontSize: 13 }}>{job.location || '—'}</td>
                  <td style={styles.td}>
                    <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                      {format(new Date(job.appliedAt), 'MMM d')}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {formatDistanceToNow(new Date(job.appliedAt), { addSuffix: true })}
                    </div>
                  </td>
                  <td style={styles.td} onClick={e => e.stopPropagation()}>
                    <select
                      value={job.status}
                      onChange={e => handleStatusChange(job.id, e.target.value)}
                      style={styles.statusSelect}
                      className={`badge-${job.status}`}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td style={styles.td} onClick={e => e.stopPropagation()}>
                    {job.cvFileName ? (
                      <a href={job.cvData} download={job.cvFileName}
                        style={{ fontSize: 11, color: 'var(--accent)' }}
                        onClick={e => e.stopPropagation()}>
                        📄 {job.cvFileName.slice(0, 10)}...
                      </a>
                    ) : (
                      <label style={styles.uploadBtn} title="Upload CV">
                        <Upload size={13} />
                        <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                          onChange={e => handleCVUpload(job.id, e)} />
                      </label>
                    )}
                  </td>
                  <td style={styles.td} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noreferrer"
                          className="btn btn-ghost" style={{ padding: 6 }}>
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button className="btn btn-ghost" style={{ padding: 6 }}
                        onClick={() => navigate(`/jobs/${job.id}`)}>
                        <Edit3 size={13} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: 6 }}
                        onClick={e => handleDelete(job.id, e)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '28px 32px', animation: 'fadeIn 0.4s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 },
  subtitle: { color: 'var(--text-2)', fontSize: 14 },
  filters: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  searchWrap: { flex: 1, minWidth: 200, position: 'relative' },
  searchIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' },
  filterSelect: { width: 'auto', minWidth: 130 },
  empty: { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    padding: '12px 16px', textAlign: 'left',
    background: 'var(--bg-2)', color: 'var(--text-3)',
    fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  td: { padding: '12px 16px', verticalAlign: 'middle' },
  companyCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 32, height: 32,
    background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,101,132,0.2))',
    border: '1px solid var(--border)',
    borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
    flexShrink: 0,
  },
  fieldBadge: {
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    padding: '3px 8px', borderRadius: 20, fontSize: 11, color: 'var(--text-2)', whiteSpace: 'nowrap',
  },
  statusSelect: {
    padding: '4px 8px', fontSize: 12, fontFamily: 'var(--font-mono)',
    width: 'auto', minWidth: 100,
  },
  uploadBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: 6, borderRadius: 6, border: '1px solid var(--border)',
    color: 'var(--text-3)', cursor: 'pointer', background: 'var(--bg-3)',
    transition: 'all 0.15s',
  },
};
