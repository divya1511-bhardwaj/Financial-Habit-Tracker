
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim()
      });

      setMessage(
        response.data.message ||
        'If your account exists, a password reset link has been sent.'
      );

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to process request. Please try again.'
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
                  x="3" y="5" width="18" height="15"
                  rx="2" stroke="currentColor" strokeWidth="1.8"
                />
                <path
                  d="m4 7 8 6 8-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h2>Forgot Password?</h2>

            <p className="auth-subtitle">
              Enter your registered email to reset your password.
            </p>

            {error && (
              <div className="error-message">{error}</div>
            )}

            {message && (
              <div className="success-message">{message}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group-custom">
                <label htmlFor="forgot-email">Email Address</label>

                <div className="input-wrapper">
                  <span className="input-symbol">✉</span>

                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'SEND RESET LINK'}
              </button>
            </form>

            <div className="auth-switch">
              Remember your password?
              <Link to="/login"> Back to Login</Link>
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
