import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../contexts/JobsContext';
import { ArrowLeft, ExternalLink, Phone, Linkedin, Save, Upload, FileDown, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJob, updateJob, deleteJob, STATUS_OPTIONS, FIELDS } = useJobs();
  const job = getJob(id);
  const [form, setForm] = useState(job || {});
  const [saved, setSaved] = useState(false);

  if (!job) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p style={{ color: 'var(--text-2)' }}>Application not found</p>
      <button className="btn btn-secondary" onClick={() => navigate('/jobs')} style={{ marginTop: 16 }}>
        Back to Applications
      </button>
    </div>
  );

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    updateJob(id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    if (confirm('Delete this application permanently?')) {
      deleteJob(id);
      navigate('/jobs');
    }
  };

  const handleCVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      set('cvFileName', file.name);
      set('cvData', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.value === form.status) || STATUS_OPTIONS[0];

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <button className="btn btn-ghost" onClick={() => navigate('/jobs')} style={{ gap: 6 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 size={14} /> Delete
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={14} /> {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={styles.jobHeader}>
        <div style={styles.companyAv}>{form.company?.[0]?.toUpperCase() || '?'}</div>
        <div style={{ flex: 1 }}>
          <input
            value={form.title || ''}
            onChange={e => set('title', e.target.value)}
            style={styles.titleInput}
            placeholder="Job Title"
          />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              value={form.company || ''}
              onChange={e => set('company', e.target.value)}
              placeholder="Company"
              style={styles.companyInput}
            />
            {form.appliedAt && (
              <span style={styles.dateChip}>
                Applied {format(new Date(form.appliedAt), 'MMMM d, yyyy')}
              </span>
            )}
          </div>
        </div>

        {/* Status selector */}
        <div style={styles.statusBlock}>
          <label style={styles.label}>Status</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            style={{ ...styles.statusSel, color: currentStatus.color }}
          >
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Left column */}
        <div style={styles.leftCol}>
          {/* Job Details */}
          <div className="card">
            <h3 style={styles.cardTitle}>Job Details</h3>
            <div style={styles.fieldGrid}>
              <FormField label="Field">
                <select value={form.field || ''} onChange={e => set('field', e.target.value)}>
                  {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </FormField>
              <FormField label="Location">
                <input value={form.location || ''} onChange={e => set('location', e.target.value)} placeholder="Tel Aviv / Remote" />
              </FormField>
              <FormField label="Employment">
                <select value={form.employmentType || 'Full-time'} onChange={e => set('employmentType', e.target.value)}>
                  {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'].map(t => <option key={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="Experience">
                <select value={form.experienceLevel || 'Junior'} onChange={e => set('experienceLevel', e.target.value)}>
                  {['Junior', 'Mid', 'Senior', 'Not specified'].map(t => <option key={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="Salary" style={{ gridColumn: '1 / -1' }}>
                <input value={form.salary || ''} onChange={e => set('salary', e.target.value)} placeholder="₪15,000 / month" />
              </FormField>
              <FormField label="Job URL" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={form.url || ''} onChange={e => set('url', e.target.value)} placeholder="https://..." />
                  {form.url && (
                    <a href={form.url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '10px 12px', flexShrink: 0 }}>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </FormField>
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <h3 style={styles.cardTitle}>Description & Requirements</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <FormField label="Job Description">
                <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={4} placeholder="Role summary..." />
              </FormField>
              <FormField label="Key Requirements">
                <textarea value={form.requirements || ''} onChange={e => set('requirements', e.target.value)} rows={3} placeholder="React, Node.js..." />
              </FormField>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <h3 style={styles.cardTitle}>Your Notes</h3>
            <textarea
              value={form.notes || ''}
              onChange={e => set('notes', e.target.value)}
              rows={4}
              placeholder="Interview prep notes, why you applied, referrals, follow-up reminders..."
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Right column */}
        <div style={styles.rightCol}>
          {/* Contact */}
          <div className="card">
            <h3 style={styles.cardTitle}>Contact Person</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FormField label="Name">
                <input value={form.contactName || ''} onChange={e => set('contactName', e.target.value)} placeholder="Recruiter name" />
              </FormField>
              <FormField label="Phone">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={form.contactPhone || ''} onChange={e => set('contactPhone', e.target.value)} placeholder="+972..." />
                  {form.contactPhone && (
                    <a href={`tel:${form.contactPhone}`} className="btn btn-secondary" style={{ padding: '10px 12px', flexShrink: 0 }}>
                      <Phone size={14} />
                    </a>
                  )}
                </div>
              </FormField>
              <FormField label="LinkedIn">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={form.contactLinkedin || ''} onChange={e => set('contactLinkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
                  {form.contactLinkedin && (
                    <a href={form.contactLinkedin} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '10px 12px', flexShrink: 0 }}>
                      <Linkedin size={14} />
                    </a>
                  )}
                </div>
              </FormField>
            </div>
          </div>

          {/* CV Upload */}
          <div className="card">
            <h3 style={styles.cardTitle}>Resume / CV</h3>
            {form.cvFileName ? (
              <div style={styles.cvFile}>
                <span style={{ fontSize: 13 }}>📄 {form.cvFileName}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <a href={form.cvData} download={form.cvFileName} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}>
                    <FileDown size={13} /> Download
                  </a>
                  <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12 }}
                    onClick={() => { set('cvFileName', ''); set('cvData', ''); }}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label style={styles.uploadArea}>
                <Upload size={20} color="var(--text-3)" />
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Upload CV (PDF, DOC)</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Click to browse</span>
                <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleCVUpload} />
              </label>
            )}
          </div>

          {/* Reminder */}
          <div className="card">
            <h3 style={styles.cardTitle}>Follow-up Reminder</h3>
            <FormField label="Remind after (days)">
              <input type="number" min={1} max={90}
                value={form.reminderDays || 7}
                onChange={e => set('reminderDays', parseInt(e.target.value))} />
            </FormField>
            {form.appliedAt && (
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
                Reminder will trigger on: {format(
                  new Date(new Date(form.appliedAt).getTime() + (form.reminderDays || 7) * 86400000),
                  'MMMM d, yyyy'
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const styles = {
  page: { padding: '24px 32px', animation: 'fadeIn 0.4s ease' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  jobHeader: {
    display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24,
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20,
  },
  companyAv: {
    width: 52, height: 52, flexShrink: 0,
    background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(255,101,132,0.3))',
    border: '1px solid var(--border)', borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
  },
  titleInput: {
    background: 'transparent', border: 'none', color: 'var(--text)',
    fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
    padding: 0, marginBottom: 6, width: '100%',
  },
  companyInput: {
    background: 'transparent', border: 'none', color: 'var(--text-2)',
    fontSize: 14, padding: 0, width: 180,
  },
  dateChip: {
    fontSize: 12, color: 'var(--text-3)',
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    padding: '3px 8px', borderRadius: 20,
  },
  statusBlock: { display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 },
  label: { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  statusSel: { background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--text)' },
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  cvFile: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  uploadArea: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    border: '2px dashed var(--border)', borderRadius: 8, padding: '24px 16px',
    cursor: 'pointer', transition: 'border-color 0.2s', textAlign: 'center',
  },
};
