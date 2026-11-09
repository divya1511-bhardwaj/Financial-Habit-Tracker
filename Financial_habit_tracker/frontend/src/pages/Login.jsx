
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', form);
      const data = response.data;
      const token = data.token || data.accessToken;

      if (!token) {
        throw new Error('Authentication token was not returned by the server.');
      }

      localStorage.setItem('token', token);

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to login. Please try again.'
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
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 21c0-4.2 3.4-7 8-7s8 2.8 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            <h2>Welcome Back!</h2>
            <p className="auth-subtitle">
              Login to continue your financial journey.
            </p>

            {location.state?.registered && (
              <div className="success-message">
                Account created successfully. Please login.
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group-custom">
                <label htmlFor="login-email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-symbol">✉</span>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="input-group-custom">
                <label htmlFor="login-password">Password</label>
                <div className="input-wrapper">
                  <span className="input-symbol">⌑</span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
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

              <div className="auth-options">
                <span>Secure login to your account</span>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'LOGIN'}
              </button>
            </form>

            <div className="auth-switch">
              Don't have an account?
              <Link to="/register"> Create Account</Link>
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
