import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Bell, User, CheckCircle, Globe, Zap } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [emailjsService, setEmailjsService] = useState(user?.emailjsService || '');
  const [emailjsTemplate, setEmailjsTemplate] = useState(user?.emailjsTemplate || '');
  const [emailjsPublic, setEmailjsPublic] = useState(user?.emailjsPublic || '');
  const [reminderDays, setReminderDays] = useState(user?.defaultReminderDays || 7);
  const [saved, setSaved] = useState('');

  const saveSection = (section) => {
    if (section === 'profile') updateUser({ email });
    if (section === 'email') updateUser({ emailjsService, emailjsTemplate, emailjsPublic });
    if (section === 'prefs') updateUser({ defaultReminderDays: reminderDays });
    setSaved(section);
    setTimeout(() => setSaved(''), 2500);
  };

  const SaveBtn = ({ section }) => (
    <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => saveSection(section)}>
      {saved === section ? <><CheckCircle size={14} /> Saved!</> : 'Save Changes'}
    </button>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}><Settings size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Settings</h1>
        <p style={styles.subtitle}>Configure your HuntBoard account</p>
      </div>

      {/* Profile */}
      <Section icon={<User size={16} />} title="Profile">
        <Field label="Username">
          <input value={user?.username || ''} disabled style={{ opacity: 0.6 }} />
          <span style={styles.hint}>Username cannot be changed</span>
        </Field>
        <Field label="Email">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </Field>
        <SaveBtn section="profile" />
      </Section>

      {/* AI */}
      <Section icon={<Zap size={16} />} title="AI Job Extraction" badge="Powered by server">
        <p style={styles.sectionDesc}>
          Job extraction is powered by Gemini AI on the server. Just paste a job URL when adding an application and click Extract — no setup needed!
        </p>
      </Section>

      {/* Email Reminders */}
      <Section icon={<Bell size={16} />} title="Email Reminders" badge="Optional">
        <p style={styles.sectionDesc}>
          Connect EmailJS to receive follow-up reminders in your inbox.
          Create a free account at{' '}
          <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
            emailjs.com
          </a>
        </p>
        <Field label="EmailJS Service ID">
          <input value={emailjsService} onChange={e => setEmailjsService(e.target.value)} placeholder="service_xxxxxxx" />
        </Field>
        <Field label="EmailJS Template ID">
          <input value={emailjsTemplate} onChange={e => setEmailjsTemplate(e.target.value)} placeholder="template_xxxxxxx" />
        </Field>
        <Field label="EmailJS Public Key">
          <input value={emailjsPublic} onChange={e => setEmailjsPublic(e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxx" />
        </Field>
        <SaveBtn section="email" />
      </Section>

      {/* Preferences */}
      <Section icon={<Globe size={16} />} title="Preferences">
        <Field label="Default reminder (days after applying)">
          <input type="number" min={1} max={90} value={reminderDays}
            onChange={e => setReminderDays(parseInt(e.target.value))}
            style={{ maxWidth: 120 }} />
          <span style={styles.hint}>You'll be reminded to follow up after this many days</span>
        </Field>
        <SaveBtn section="prefs" />
      </Section>

      {/* Danger zone */}
      <div className="card" style={styles.dangerZone}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#ff6584', marginBottom: 8 }}>
          Danger Zone
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
          Clear all your application data. This action cannot be undone.
        </p>
        <button className="btn btn-danger" onClick={() => {
          if (confirm('Delete ALL applications? This cannot be undone.')) {
            window.location.reload();
          }
        }}>
          Clear All Applications
        </button>
      </div>
    </div>
  );
}

function Section({ icon, title, badge, children }) {
  return (
    <div className="card" style={styles.section}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>{icon}</span>
          {title}
        </div>
        {badge && <span style={styles.badge}>{badge}</span>}
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const styles = {
  page: { padding: '28px 32px', maxWidth: 640, animation: 'fadeIn 0.4s ease' },
  header: { marginBottom: 28 },
  title: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 },
  subtitle: { color: 'var(--text-2)', fontSize: 14 },
  section: { marginBottom: 16, padding: 20 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 },
  sectionIcon: { color: 'var(--accent)' },
  sectionDesc: { fontSize: 13, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.6 },
  badge: {
    background: 'rgba(108,99,255,0.1)', color: 'var(--accent)',
    border: '1px solid rgba(108,99,255,0.2)',
    padding: '2px 8px', borderRadius: 20, fontSize: 11,
  },
  sectionBody: { display: 'flex', flexDirection: 'column', gap: 14 },
  hint: { fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 },
  dangerZone: { border: '1px solid rgba(255,101,132,0.2)', background: 'rgba(255,101,132,0.03)' },
};