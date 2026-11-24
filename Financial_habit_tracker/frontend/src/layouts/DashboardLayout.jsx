
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AdminSidebar from '../components/AdminSidebar';
import Topbar from '../components/Topbar';

export default function DashboardLayout() {
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="app-layout">
      {isAdmin ? <AdminSidebar /> : <Sidebar />}

      <div className="main-area">
        <Topbar />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
