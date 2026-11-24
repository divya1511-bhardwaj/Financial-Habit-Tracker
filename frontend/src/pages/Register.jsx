
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
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
      await api.post('/auth/register', form);

      navigate('/login', {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
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
            <h1>Start Your<br />Financial Journey</h1>
            <p>
              Track your income.<br />
              Build habits. Reach your goals.
            </p>
            <div className="art-tag">SMALL STEPS. BIG GOALS.</div>
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

            <h2>Create Account</h2>
            <p className="auth-subtitle">
              Join us and take control of your finances.
            </p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group-custom">
                <label htmlFor="register-name">Full Name</label>
                <div className="input-wrapper">
                  <span className="input-symbol">♙</span>
                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="input-group-custom">
                <label htmlFor="register-email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-symbol">✉</span>
                  <input
                    id="register-email"
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
                <label htmlFor="register-password">Password</label>
                <div className="input-wrapper">
                  <span className="input-symbol">⌑</span>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password"
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
                {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
              </button>
            </form>

            <div className="auth-switch">
              Already have an account?
              <Link to="/login"> Login</Link>
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
