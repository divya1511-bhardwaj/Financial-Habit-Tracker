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
  const [admins, setAdmins] = useState([]);

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

  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [updatingRole, setUpdatingRole] = useState("");

  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Current logged-in admin
  let currentUser = {};

  try {
    currentUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch {
    currentUser = {};
  }

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [statsRes, usersRes, adminsRes] = await Promise.all([
        api.get("/admin/stats"),

        api.get("/admin/users", {
          params: { page, limit: 10, search },
        }),

        api.get("/admin/admins", {
          params: { page: 1, limit: 100 },
        }),
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
      setAdmins(adminsRes.data.admins || []);

      setPagination(
        usersRes.data.pagination || {
          total: 0,
          totalPages: 1,
          limit: 10,
        }
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [page, search]);

  // Search users
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  // Activate / Deactivate user
  const toggleStatus = async (user) => {
    setError("");
    setMessage("");

    try {
      const response = await api.patch(
        `/admin/users/${user._id}/status`,
        { active: !user.active }
      );

      setMessage(
        response.data.message || "User status updated."
      );

      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update user status."
      );
    }
  };

  // Create Admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      setCreatingAdmin(true);

      const response = await api.post(
        "/admin/create-admin",
        adminForm
      );

      setMessage(
        response.data.message || "Admin created successfully."
      );

      setAdminForm({
        name: "",
        email: "",
        password: "",
      });

      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create admin."
      );
    } finally {
      setCreatingAdmin(false);
    }
  };

  // Promote / Demote user
  const handleRoleChange = async (user, newRole) => {
    setError("");
    setMessage("");

    try {
      setUpdatingRole(user._id);

      const response = await api.patch(
        `/admin/users/${user._id}/role`,
        { role: newRole }
      );

      setMessage(
        response.data.message || "User role updated successfully."
      );

      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update user role."
      );
    } finally {
      setUpdatingRole("");
    }
  };

  return (
    <div className="page-content">

      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users and monitor platform activity.</p>
        </div>
      </div>

      {error && (
        <div className="page-alert error">{error}</div>
      )}

      {message && (
        <div className="page-alert success">{message}</div>
      )}

      {/* Statistics */}
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

      {/* Create Admin */}
      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>Create Admin</h3>
            <p>Create a new administrator account.</p>
          </div>
        </div>

        <form
          onSubmit={handleCreateAdmin}
          className="admin-search-form"
        >
          <input
            type="text"
            placeholder="Admin name"
            value={adminForm.name}
            onChange={(e) =>
              setAdminForm({
                ...adminForm,
                name: e.target.value,
              })
            }
            required
          />

          <input
            type="email"
            placeholder="Admin email"
            value={adminForm.email}
            onChange={(e) =>
              setAdminForm({
                ...adminForm,
                email: e.target.value,
              })
            }
            required
          />

          <input
            type="password"
            placeholder="Password (minimum 6 characters)"
            value={adminForm.password}
            onChange={(e) =>
              setAdminForm({
                ...adminForm,
                password: e.target.value,
              })
            }
            minLength={6}
            required
          />

          <button
            type="submit"
            className="page-primary-btn"
            disabled={creatingAdmin}
          >
            {creatingAdmin ? "Creating..." : "Create Admin"}
          </button>
        </form>
      </div>

      {/* User Management */}
      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>User Management</h3>
            <p>Search users and manage their account status and roles.</p>
          </div>
        </div>

        <form
          className="admin-search-form"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) =>
              setSearchInput(e.target.value)
            }
            placeholder="Search by name or email..."
          />

          <button
            className="page-primary-btn"
            type="submit"
          >
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
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>

                    <td>
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={`admin-user-status ${
                          user.active ? "active" : "inactive"
                        }`}
                      >
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      {/* Active / Inactive toggle switch */}
                      <label
                        className="switch"
                        title={user.active ? "Deactivate" : "Activate"}
                      >
                        <input
                          type="checkbox"
                          checked={!!user.active}
                          onChange={() => toggleStatus(user)}
                          disabled={updatingRole === user._id}
                        />
                        <span className="switch-slider" />
                      </label>

                      <button
                        className="admin-status-btn activate"
                        onClick={() =>
                          handleRoleChange(user, "ADMIN")
                        }
                        disabled={updatingRole === user._id}
                      >
                        {updatingRole === user._id
                          ? "Updating..."
                          : "Promote to Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User Pagination */}
        <div className="admin-pagination">
          <span>
            {pagination.total} users · Page {page} of{" "}
            {Math.max(1, pagination.totalPages)}
          </span>

          <div>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((current) => current - 1)
              }
            >
              Previous
            </button>

            <button
              type="button"
              disabled={
                page >= pagination.totalPages || loading
              }
              onClick={() =>
                setPage((current) => current + 1)
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Admin Management */}
      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>Admin Management</h3>
            <p>View administrators and manage their roles.</p>
          </div>
        </div>

        {loading ? (
          <p>Loading admins...</p>
        ) : admins.length === 0 ? (
          <div className="page-empty">No admins found.</div>
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
                {admins.map((admin) => (
                  <tr key={admin._id}>
                    <td>
                      {admin.name}
                      {admin._id === currentUser.id ||
                      admin._id === currentUser._id
                        ? " (You)"
                        : ""}
                    </td>

                    <td>{admin.email}</td>

                    <td>
                      {admin.createdAt
                        ? new Date(
                            admin.createdAt
                          ).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={`admin-user-status ${
                          admin.active ? "active" : "inactive"
                        }`}
                      >
                        {admin.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      {admin._id === currentUser.id ||
                      admin._id === currentUser._id ? (
                        <span>Current Admin</span>
                      ) : (
                        <button
                          className="admin-status-btn deactivate"
                          onClick={() =>
                            handleRoleChange(admin, "USER")
                          }
                          disabled={updatingRole === admin._id}
                        >
                          {updatingRole === admin._id
                            ? "Updating..."
                            : "Demote to User"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}