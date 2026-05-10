import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        NewsBrief
      </NavLink>
      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Feed
        </NavLink>
        <NavLink
          to="/bookmarks"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Saved
        </NavLink>
        <NavLink
          to="/preferences"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Preferences
        </NavLink>
      </nav>
      <div className="nav-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          {user?.name}
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
