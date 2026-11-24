
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/auth/reset-password/${token}`, {
        password
      });

      navigate('/login', {
        replace: true,
        state: {
          passwordReset: true
        }
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">

        <div className="auth-art-panel">
          <div className="art-shape shape-one"></div>
          <div className="art-shape shape-two"></div>
          <div className="art-shape shape-three"></div>

          <div className="art-content">
            <div className="brand-mark">F</div>
            <h1>Finance<br />Habit Builder</h1>
            <p>
              Build smarter habits.<br />
              Create a better financial future.
            </p>
            <div className="art-tag">YOUR MONEY. YOUR GOALS.</div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-content">

            <div className="auth-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <rect
                  x="4" y="10" width="16" height="11"
                  rx="2" stroke="currentColor" strokeWidth="1.8"
                />
                <path
                  d="M8 10V7a4 4 0 0 1 8 0v3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h2>Reset Password</h2>

            <p className="auth-subtitle">
              Create a new password for your account.
            </p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group-custom">
                <label htmlFor="new-password">New Password</label>

                <div className="input-wrapper">
                  <span className="input-symbol">⌑</span>

                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="input-group-custom">
                <label htmlFor="confirm-password">
                  Confirm Password
                </label>

                <div className="input-wrapper">
                  <span className="input-symbol">⌑</span>

                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'RESET PASSWORD'}
              </button>
            </form>

            <div className="auth-switch">
              <Link to="/login">Back to Login</Link>
            </div>

            <div className="auth-footer">
              © 2026 Finance Habit Builder
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
