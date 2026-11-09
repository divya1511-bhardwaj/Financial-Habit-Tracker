
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0,
  });
  const [users, setUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users", {
          params: { page, limit: 10, search },
        }),
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
      setPagination(usersRes.data.pagination || {
        total: 0,
        totalPages: 1,
        limit: 10,
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const toggleStatus = async (user) => {
    setError("");
    setMessage("");

    try {
      const response = await api.patch(
        `/admin/users/${user._id}/status`,
        { active: !user.active }
      );

      setMessage(response.data.message || "User status updated.");
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user status.");
    }
  };

  return (
    <div className="page-content">
      <div className="welcome-section">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users and monitor platform activity.</p>
        </div>
      </div>

      {error && <div className="page-alert error">{error}</div>}
      {message && <div className="page-alert success">{message}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Users</span>
          <h2>{stats.totalUsers}</h2>
        </div>
        <div className="stat-card">
          <span>Active Users</span>
          <h2>{stats.activeUsers}</h2>
        </div>
        <div className="stat-card">
          <span>Inactive Users</span>
          <h2>{stats.inactiveUsers}</h2>
        </div>
        <div className="stat-card">
          <span>Admin Accounts</span>
          <h2>{stats.adminUsers}</h2>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>User Management</h3>
            <p>Search users and manage their account status.</p>
          </div>
        </div>

        <form className="admin-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
          />
          <button className="page-primary-btn" type="submit">
            Search
          </button>
        </form>

        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <div className="page-empty">No users found.</div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td>
                      <span className={`admin-user-status ${user.active ? "active" : "inactive"}`}>
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`admin-status-btn ${user.active ? "deactivate" : "activate"}`}
                        onClick={() => toggleStatus(user)}
                      >
                        {user.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-pagination">
          <span>
            {pagination.total} users · Page {page} of {Math.max(1, pagination.totalPages)}
          </span>
          <div>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
