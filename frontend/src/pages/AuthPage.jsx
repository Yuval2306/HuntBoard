import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.username, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.grid} />

      <div style={styles.logoWrap}>
        <div style={styles.logoIcon}>
          <Briefcase size={22} color="#6c63ff" />
        </div>
        <span style={styles.logoText}>HuntBoard</span>
      </div>

      <div style={styles.container} className="animate-fade">
        <div style={styles.header}>
          <h1 style={styles.title}>
            {mode === 'login' ? 'Welcome back' : 'Start tracking'}
          </h1>
          <p style={styles.subtitle}>
            {mode === 'login'
              ? 'Your job hunt dashboard awaits'
              : 'Never lose track of an application again'}
          </p>
        </div>

        <div style={styles.tabs}>
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => { setMode(t); setError(''); }}
              style={{ ...styles.tab, ...(mode === t ? styles.tabActive : {}) }}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handle} style={styles.form}>
          {mode === 'register' && (
            <div style={styles.field}>
              <label style={styles.label}>
                <User size={13} /> Username
              </label>
              <input
                type="text"
                placeholder="yourname"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                minLength={3}
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>
              <Mail size={13} /> Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <Lock size={13} /> Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submit}
            disabled={loading}
          >
            {loading && <span style={styles.spinner} />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight size={16} />
          </button>
        </form>

        <p style={styles.switchText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={styles.switchBtn}
          >
            {mode === 'login' ? 'Register free' : 'Sign in'}
          </button>
        </p>
      </div>

      <div style={styles.footer}>
        Built by{' '}
        <a href="https://www.linkedin.com/in/yuval-boker-43792537b/" target="_blank" rel="noreferrer" style={styles.footerLink}>
          Yuval Boker
        </a>
      </div>

    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(108,99,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(108,99,255,0.05) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  logoIcon: {
    width: 42,
    height: 42,
    background: 'rgba(108,99,255,0.1)',
    border: '1px solid rgba(108,99,255,0.3)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--text)',
  },
  container: {
    width: '100%',
    maxWidth: 420,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 16,
    padding: 32,
    boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(108,99,255,0.08)',
  },
  header: { marginBottom: 24, textAlign: 'center' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    marginBottom: 6,
  },
  subtitle: { color: 'var(--text-2)', fontSize: 14 },
  tabs: {
    display: 'flex',
    background: 'var(--bg-3)',
    borderRadius: 8,
    padding: 3,
    marginBottom: 24,
    gap: 3,
  },
  tab: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: 'var(--text-2)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'var(--font-body)',
  },
  tabActive: {
    background: 'var(--accent)',
    color: 'white',
    boxShadow: '0 2px 8px rgba(108,99,255,0.4)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-2)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--text-3)',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  error: {
    background: 'rgba(255,101,132,0.1)',
    border: '1px solid rgba(255,101,132,0.3)',
    color: '#ff6584',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
  },
  submit: {
    width: '100%',
    justifyContent: 'center',
    padding: '12px',
    fontSize: 15,
    marginTop: 4,
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  switchText: { textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-2)' },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  footer: {
    marginTop: 28,
    fontSize: 13,
    color: 'var(--text-3)',
  },
  footerLink: {
    color: 'var(--accent)',
    fontWeight: 500,
    textDecoration: 'none',
  },
};