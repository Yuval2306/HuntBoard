import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useJobs } from '../contexts/JobsContext';
import {
  LayoutDashboard, Briefcase, BarChart2, Settings,
  LogOut, Code2, Bell, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Applications' },
  { to: '/stats', icon: BarChart2, label: 'Analytics' },
  { to: '/leetcode', icon: Code2, label: 'LeetCode' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { stats } = useJobs();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div style={{ ...styles.sidebar, ...(collapsed ? styles.sidebarCollapsed : {}) }}>
      {/* Header */}
      <div style={styles.sidebarHeader}>
        {!collapsed && (
          <div style={styles.logo}>
            <div style={styles.logoIcon}><Briefcase size={16} color="#6c63ff" /></div>
            <span style={styles.logoText}>ApplyTrack</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={styles.collapseBtn}>
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Stats pill */}
      {!collapsed && (
        <div style={styles.statsPill}>
          <span style={styles.statsNum}>{stats.total}</span>
          <span style={styles.statsLabel}>Applications</span>
          <span style={{ ...styles.statsNum, color: '#43e97b' }}>{stats.offer}</span>
          <span style={styles.statsLabel}>Offers</span>
        </div>
      )}

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
              ...(collapsed ? styles.navItemCollapsed : {}),
            })}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ ...styles.userSection, ...(collapsed ? { padding: '12px 8px' } : {}) }}>
        {!collapsed && (
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div style={styles.userName}>{user?.username}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div style={styles.desktopOnly}>
        <SidebarContent />
      </div>

      {/* Mobile toggle */}
      <button style={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)}>
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={styles.mobileOverlay} onClick={() => setMobileOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={styles.mobileSidebar}>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  desktopOnly: { display: 'flex', height: '100vh', position: 'sticky', top: 0 },
  sidebar: {
    width: 220,
    height: '100vh',
    background: 'var(--bg-2)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 12px',
    gap: 4,
    transition: 'width 0.2s',
    flexShrink: 0,
  },
  sidebarCollapsed: { width: 60 },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: '4px 4px',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 32,
    height: 32,
    background: 'rgba(108,99,255,0.1)',
    border: '1px solid rgba(108,99,255,0.3)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: '-0.01em',
  },
  collapseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-3)',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  },
  statsPill: {
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    fontSize: 12,
  },
  statsNum: { fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color: 'var(--accent)' },
  statsLabel: { color: 'var(--text-3)', fontSize: 11 },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    color: 'var(--text-2)',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.15s',
    textDecoration: 'none',
  },
  navItemActive: {
    background: 'rgba(108,99,255,0.12)',
    color: 'var(--accent)',
    borderLeft: '2px solid var(--accent)',
  },
  navItemCollapsed: { justifyContent: 'center', padding: '10px' },
  userSection: {
    borderTop: '1px solid var(--border)',
    paddingTop: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: 8 },
  avatar: {
    width: 32,
    height: 32,
    background: 'linear-gradient(135deg, var(--accent), #ff6584)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 13,
    color: 'white',
    flexShrink: 0,
  },
  userName: { fontSize: 13, fontWeight: 500, color: 'var(--text)' },
  userEmail: { fontSize: 11, color: 'var(--text-3)', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--text-3)',
    borderRadius: 6,
    padding: '7px 10px',
    cursor: 'pointer',
    fontSize: 13,
    width: '100%',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-body)',
  },
  mobileToggle: {
    display: 'none',
    position: 'fixed',
    top: 12,
    left: 12,
    zIndex: 100,
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    padding: 8,
    cursor: 'pointer',
  },
  mobileOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 200,
    display: 'none',
  },
  mobileSidebar: { width: 220, height: '100%', background: 'var(--bg-2)' },
};
