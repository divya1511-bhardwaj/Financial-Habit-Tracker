
import { NavLink, useNavigate } from 'react-router-dom';

export default function AdminSidebar() {
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
          <span>ADMIN PANEL</span>
        </div>
      </div>

      <div className="sidebar-label">ADMIN MENU</div>

      <nav className="sidebar-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <span className="sidebar-icon">▤</span>
          <span>Admin Dashboard</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom" style={{ marginBottom: "16px" }}>
  <button
    className="sidebar-logout"
    style={{ marginTop: "16px" }}
    onClick={logout}
  >
    <span>↪</span> Logout
  </button>
</div>
    </aside>
  );
}
