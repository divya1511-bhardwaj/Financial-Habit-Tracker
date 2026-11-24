
import { NavLink, useNavigate } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '▦' },
  { label: 'Transactions', path: '/transactions', icon: '↔' },
  { label: 'Habit Tracker', path: '/habits', icon: '◷' },
  { label: 'Savings Goals', path: '/savings-goals', icon: '◎' },
  { label: 'Wealth Analytics', path: '/wealth', icon: '▥' },
];

const accountItems = [
  { label: 'Feedback', path: '/feedback', icon: '✉' },
  { label: 'Profile & Settings', path: '/profile', icon: '♙' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">F</div>
        <div>
          <h3>Finora</h3>
          <span>FINANCIAL WELLNESS</span>
        </div>
      </div>

      <div className="sidebar-label">MAIN MENU</div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-label account-label">PREFERENCES</div>

      <nav className="sidebar-nav">
        {accountItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
                <button className="sidebar-logout" onClick={logout}>
          <span>↪</span> Logout
        </button>
      </div>
    </aside>
  );
}
