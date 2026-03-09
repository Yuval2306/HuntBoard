import { useState } from 'react';
import { useJobs } from '../contexts/JobsContext';
import { useAuth } from '../contexts/AuthContext';
import { extractJobWithGemini } from '../utils/gemini';
import { X, Link, FileText, Sparkles, Loader, AlertCircle, CheckCircle } from 'lucide-react';

export default function AddJobModal({ onClose, onAdded }) {
  const { addJob, FIELDS } = useJobs();
  const [mode, setMode] = useState('url'); // url | manual
  const [url, setUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [extracted, setExtracted] = useState(false);
  const [form, setForm] = useState({
    title: '', company: '', field: FIELDS[0], location: '',
    salary: '', description: '', requirements: '', employmentType: 'Full-time',
    experienceLevel: 'Junior', contactName: '', contactPhone: '', contactLinkedin: '',
    url: '', notes: '', reminderDays: 7,
  });

  const handleExtract = async () => {
    if (!url.trim()) return;
    setExtracting(true);
    setExtractError('');
    try {
      const data = await extractJobWithGemini(url);

      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        company: data.company || prev.company,
        field: FIELDS.includes(data.field) ? data.field : prev.field,
        location: data.location || prev.location,
        salary: data.salary || prev.salary,
        description: data.description || prev.description,
        requirements: data.requirements || prev.requirements,
        employmentType: data.employmentType || prev.employmentType,
        experienceLevel: data.experienceLevel || prev.experienceLevel,
        contactName: data.contactName || prev.contactName,
        url,
      }));
      setExtracted(true);
    } catch (err) {
      setExtractError(err.message);
    }
    setExtracting(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const job = addJob({ ...form, url: url || form.url });
    onAdded?.(job);
    onClose();
  };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>New Application</h2>
            <p style={styles.modalSub}>Track a job you applied to</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Mode tabs */}
        <div style={styles.modeTabs}>
          <button style={{ ...styles.modeTab, ...(mode === 'url' ? styles.modeTabActive : {}) }}
            onClick={() => setMode('url')}>
            <Sparkles size={14} /> AI Extract from URL
          </button>
          <button style={{ ...styles.modeTab, ...(mode === 'manual' ? styles.modeTabActive : {}) }}
            onClick={() => setMode('manual')}>
            <FileText size={14} /> Manual Entry
          </button>
        </div>

        {/* URL extraction */}
        {mode === 'url' && (
          <div style={styles.urlSection}>
            <div style={styles.urlRow}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Link size={14} style={styles.urlIcon} />
                <input
                  type="url"
                  placeholder="https://linkedin.com/jobs/view/... or paste job description"
                  value={url}
                  onChange={e => { setUrl(e.target.value); setExtracted(false); setExtractError(''); }}
                  style={{ paddingLeft: 36 }}
                />
              </div>
              <button className="btn btn-primary" onClick={handleExtract} disabled={extracting || !url}>
                {extracting ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                {extracting ? 'Extracting...' : 'Extract'}
              </button>
            </div>
{extractError && (
  <div style={styles.extractError}>
    <AlertCircle size={14} /> {extractError}
    {extractError.includes('LinkedIn') && (
      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
        💡 Copy the job text from LinkedIn and paste it in the URL field instead.
      </div>
    )}
  </div>
)}
            {extracted && (
              <div style={styles.extractSuccess}>
                <CheckCircle size={14} /> Job details extracted! Review below and save.
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <Field label="Job Title *">
              <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="Software Engineer" />
            </Field>
            <Field label="Company *">
              <input required value={form.company} onChange={e => set('company', e.target.value)} placeholder="Google" />
            </Field>
            <Field label="Field">
              <select value={form.field} onChange={e => set('field', e.target.value)}>
                {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Tel Aviv, Israel / Remote" />
            </Field>
            <Field label="Employment Type">
              <select value={form.employmentType} onChange={e => set('employmentType', e.target.value)}>
                {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Experience Level">
              <select value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                {['Junior', 'Mid', 'Senior', 'Not specified'].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Salary Range">
              <input value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="e.g. ₪15,000 - ₪20,000 / month" />
            </Field>
            <Field label="Job URL">
              <input type="url" value={form.url || url} onChange={e => set('url', e.target.value)} placeholder="https://..." />
            </Field>
          </div>

          {/* Contact section */}
          <div style={styles.sectionDivider}>
            <span>Contact Person (optional)</span>
          </div>
          <div style={styles.formGrid}>
            <Field label="Name">
              <input value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Recruiter / HR name" />
            </Field>
            <Field label="Phone">
              <input value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="+972 50 000 0000" />
            </Field>
            <Field label="LinkedIn" style={{ gridColumn: '1 / -1' }}>
              <input value={form.contactLinkedin} onChange={e => set('contactLinkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
            </Field>
          </div>

          {/* Description */}
          <div style={styles.sectionDivider}><span>Details</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Description">
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={3} placeholder="Role summary..." />
            </Field>
            <Field label="Key Requirements">
              <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)}
                rows={2} placeholder="React, Node.js, 2+ years experience..." />
            </Field>
            <Field label="Your Notes">
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                rows={2} placeholder="Why you applied, referrals, etc..." />
            </Field>
            <Field label="Reminder (days after applying)">
              <input type="number" min={1} max={90} value={form.reminderDays}
                onChange={e => set('reminderDays', parseInt(e.target.value))} style={{ maxWidth: 100 }} />
            </Field>
          </div>

          <div style={styles.actions}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              Save Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const styles = {
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 },
  modalSub: { color: 'var(--text-2)', fontSize: 13, marginTop: 2 },
  modeTabs: { display: 'flex', gap: 8, marginBottom: 16 },
  modeTab: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--bg-3)', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13,
    fontFamily: 'var(--font-body)', transition: 'all 0.15s',
  },
  modeTabActive: { background: 'rgba(108,99,255,0.12)', color: 'var(--accent)', borderColor: 'rgba(108,99,255,0.3)' },
  urlSection: { marginBottom: 20 },
  urlRow: { display: 'flex', gap: 10, alignItems: 'center' },
  urlIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' },
  extractError: {
    marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
    color: '#ff6584', background: 'rgba(255,101,132,0.08)',
    border: '1px solid rgba(255,101,132,0.2)', borderRadius: 6, padding: '8px 12px', fontSize: 13,
  },
  extractSuccess: {
    marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
    color: '#43e97b', background: 'rgba(67,233,123,0.08)',
    border: '1px solid rgba(67,233,123,0.2)', borderRadius: 6, padding: '8px 12px', fontSize: 13,
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 },
  sectionDivider: {
    display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 12px',
    color: 'var(--text-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
    '&::before': { content: '""', flex: 1, height: 1, background: 'var(--border)' },
  },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
};
