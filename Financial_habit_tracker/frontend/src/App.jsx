// import { useEffect, useState } from 'react';
// import {
//   Routes,
//   Route,
//   Navigate,
//   Link,
//   useNavigate,
// } from 'react-router-dom';
// import api from './api/axios';

// function Login() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const response = await api.post('/auth/login', form);
//       const data = response.data;
//       const token = data.token || data.accessToken;

//       if (!token) {
//         throw new Error('Login response did not contain a token. Check your backend response format.');
//       }

//       localStorage.setItem('token', token);

//       if (data.user) {
//         localStorage.setItem('user', JSON.stringify(data.user));
//       }

//       navigate('/dashboard');
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//         err.message ||
//         'Login failed. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <form className="auth-card" onSubmit={handleSubmit}>
//         <h2>Welcome Back</h2>
//         <p className="muted">Login to manage your financial habits.</p>

//         {error && <div className="alert alert-danger">{error}</div>}

//         <label>Email</label>
//         <input
//           className="form-control mb-3"
//           type="email"
//           name="email"
//           value={form.email}
//           onChange={handleChange}
//           placeholder="Enter your email"
//           required
//         />

//         <label>Password</label>
//         <input
//           className="form-control mb-3"
//           type="password"
//           name="password"
//           value={form.password}
//           onChange={handleChange}
//           placeholder="Enter your password"
//           required
//         />

//         <button className="btn btn-primary w-100" disabled={loading}>
//           {loading ? 'Logging in...' : 'Login'}
//         </button>

//         <p className="mt-3 text-center">
//           Don't have an account? <Link to="/register">Register</Link>
//         </p>
//       </form>
//     </div>
//   );
// }

// function Register() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       await api.post('/auth/register', form);
//       navigate('/login', {
//         replace: true,
//         state: { registered: true },
//       });
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//         'Registration failed. Check the details and try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <form className="auth-card" onSubmit={handleSubmit}>
//         <h2>Create Account</h2>
//         <p className="muted">Start building better financial habits.</p>

//         {error && <div className="alert alert-danger">{error}</div>}

//         <label>Full Name</label>
//         <input
//           className="form-control mb-3"
//           name="name"
//           value={form.name}
//           onChange={handleChange}
//           placeholder="Enter your name"
//           required
//         />

//         <label>Email</label>
//         <input
//           className="form-control mb-3"
//           type="email"
//           name="email"
//           value={form.email}
//           onChange={handleChange}
//           placeholder="Enter your email"
//           required
//         />

//         <label>Password</label>
//         <input
//           className="form-control mb-3"
//           type="password"
//           name="password"
//           value={form.password}
//           onChange={handleChange}
//           placeholder="Create a password"
//           minLength={6}
//           required
//         />

//         <button className="btn btn-primary w-100" disabled={loading}>
//           {loading ? 'Creating account...' : 'Register'}
//         </button>

//         <p className="mt-3 text-center">
//           Already registered? <Link to="/login">Login</Link>
//         </p>
//       </form>
//     </div>
//   );
// }

// function Dashboard() {
//   const navigate = useNavigate();
//   const [dashboardData, setDashboardData] = useState(null);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);

//   const savedUser = JSON.parse(localStorage.getItem('user') || '{}');

//   useEffect(() => {
//     const loadDashboard = async () => {
//       try {
//         const response = await api.get('/dashboard');
//         setDashboardData(response.data);
//       } catch (err) {
//         setError(
//           err.response?.data?.message ||
//           'Could not load dashboard data.'
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboard();
//   }, []);

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/login', { replace: true });
//   };

//   return (
//     <div className="dashboard-page">
//       <nav className="navbar navbar-dark bg-primary px-4">
//         <span className="navbar-brand">
//           Finance Habit Tracker
//         </span>
//         <button className="btn btn-light btn-sm" onClick={logout}>
//           Logout
//         </button>
//       </nav>

//       <main className="container py-5">
//         <h2>
//           Welcome{savedUser.name ? `, ${savedUser.name}` : ''}!
//         </h2>
//         <p className="muted">
//           Your financial overview at a glance.
//         </p>

//         {loading && <p>Loading dashboard...</p>}

//         {error && (
//           <div className="alert alert-warning">{error}</div>
//         )}

//         {!loading && dashboardData && (
//           <section className="dashboard-card mt-4">
//             <h4>Dashboard API Response</h4>
//             <p className="muted">
//               Your backend dashboard data is connected.
//             </p>
//             <pre className="data-preview">
//               {JSON.stringify(dashboardData, null, 2)}
//             </pre>
//           </section>
//         )}

//         <div className="row g-3 mt-3">
//           <div className="col-md-4">
//             <div className="dashboard-card">
//               <h5>Transactions</h5>
//               <p>Manage your income and expenses.</p>
//               <span className="badge text-bg-primary">Coming next</span>
//             </div>
//           </div>

//           <div className="col-md-4">
//             <div className="dashboard-card">
//               <h5>Daily Habits</h5>
//               <p>Track your financial habits.</p>
//               <span className="badge text-bg-primary">Coming next</span>
//             </div>
//           </div>

//           <div className="col-md-4">
//             <div className="dashboard-card">
//               <h5>Savings Goals</h5>
//               <p>Keep track of your savings targets.</p>
//               <span className="badge text-bg-primary">Coming next</span>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// function ProtectedRoute({ children }) {
//   const token = localStorage.getItem('token');

//   return token ? children : <Navigate to="/login" replace />;
// }

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to="/dashboard" replace />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         }
//       />
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";

import Transactions from "./pages/Transactions";
import Habits from "./pages/Habits";
import SavingsGoals from "./pages/SavingsGoals";
import Wealth from "./pages/Wealth";
import Feedback from "./pages/Feedback";
import AdminDashboard from "./pages/AdminDashboard";
import ProfileSettings from "./pages/ProfileSettings";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes with common layout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/savings-goals" element={<SavingsGoals />} />
        <Route path="/wealth" element={<Wealth />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<ProfileSettings />} />
      </Route>

      {/* Unknown route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
