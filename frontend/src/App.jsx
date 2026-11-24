
import { Navigate, Route, Routes } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';

import Transactions from './pages/Transactions';
import Habits from './pages/Habits';
import SavingsGoals from './pages/SavingsGoals';
import Wealth from './pages/Wealth';
import Feedback from './pages/Feedback';
import AdminDashboard from './pages/AdminDashboard';
import ProfileSettings from './pages/ProfileSettings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Get logged-in user safely
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

// Check login
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Check role
function RoleProtectedRoute({ children, allowedRole }) {
  const user = getCurrentUser();

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return (
      <Navigate
        to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
        replace
      />
    );
  }

  return children;
}

// Decide landing page according to role
function HomeRedirect() {
  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();

  return (
    <Navigate
      to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
      replace
    />
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Password reset routes - accessible without login */}
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      {/* Common protected layout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* USER ONLY */}
        <Route
          path="/dashboard"
          element={
            <RoleProtectedRoute allowedRole="USER">
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <RoleProtectedRoute allowedRole="USER">
              <Transactions />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/habits"
          element={
            <RoleProtectedRoute allowedRole="USER">
              <Habits />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/savings-goals"
          element={
            <RoleProtectedRoute allowedRole="USER">
              <SavingsGoals />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/wealth"
          element={
            <RoleProtectedRoute allowedRole="USER">
              <Wealth />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <RoleProtectedRoute allowedRole="USER">
              <Feedback />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <RoleProtectedRoute allowedRole="USER">
              <ProfileSettings />
            </RoleProtectedRoute>
          }
        />

        {/* ADMIN ONLY */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
