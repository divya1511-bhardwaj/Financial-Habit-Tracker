
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ProfileSettings() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [settings, setSettings] = useState({
    currency: "INR",
    remindersEnabled: true,
    emailNotifications: true,
    theme: "light",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [profileRes, settingsRes] = await Promise.all([
          api.get("/profile"),
          api.get("/profile/settings"),
        ]);

        setProfile({
          name: profileRes.data.user?.name || "",
          email: profileRes.data.user?.email || "",
        });

        if (settingsRes.data.settings) {
          setSettings((previous) => ({
            ...previous,
            ...settingsRes.data.settings,
          }));
        }

        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load profile settings.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const showMessage = (text) => {
    setError("");
    setMessage(text);
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!profile.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    try {
      setSavingProfile(true);
      const response = await api.patch("/profile", {
        name: profile.name.trim(),
      });
      setProfile((previous) => ({
        ...previous,
        name: response.data.user?.name || previous.name,
      }));
      showMessage(response.data.message || "Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const updateSettings = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setSavingSettings(true);
      const payload = {
        currency: settings.currency,
        remindersEnabled: settings.remindersEnabled,
        emailNotifications: settings.emailNotifications,
        theme: settings.theme,
      };

      const response = await api.patch("/profile/settings", payload);
      if (response.data.settings) {
        setSettings((previous) => ({
          ...previous,
          ...response.data.settings,
        }));
      }
      showMessage(response.data.message || "Settings saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (passwords.newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    try {
      setSavingPassword(true);
      const response = await api.patch("/profile/change-password", passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      showMessage(
        response.data.message || "Password changed. Please log in again."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="page-content"><p>Loading profile...</p></div>;
  }

  return (
    <div className="page-content">
      <div className="welcome-section">
        <div>
          <h1>Profile & Settings</h1>
          <p>Manage your personal information and preferences.</p>
        </div>
      </div>

      {error && <div className="page-alert error">{error}</div>}
      {message && <div className="page-alert success">{message}</div>}

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>Personal Information</h3>
            <p>Update your account details.</p>
          </div>
        </div>

        <form className="page-form" onSubmit={updateProfile}>
          <div className="form-field">
            <label>Full Name</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label>Email Address</label>
            <input value={profile.email} readOnly />
          </div>

          <button className="page-primary-btn" disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>Application Preferences</h3>
            <p>Choose your preferred app settings.</p>
          </div>
        </div>

        <form className="page-form" onSubmit={updateSettings}>
          <div className="form-field">
            <label>Currency</label>
            <select
              value={settings.currency}
              onChange={(e) =>
                setSettings({ ...settings, currency: e.target.value })
              }
            >
              <option value="INR">Indian Rupee (INR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
            </select>
          </div>

          <div className="form-field">
            <label>Theme</label>
            <select
              value={settings.theme}
              onChange={(e) =>
                setSettings({ ...settings, theme: e.target.value })
              }
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={Boolean(settings.remindersEnabled)}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  remindersEnabled: e.target.checked,
                })
              }
            />
            <span>
              <strong>Habit Reminders</strong>
              <small>Enable reminders for your financial habits.</small>
            </span>
          </label>

          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={Boolean(settings.emailNotifications)}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  emailNotifications: e.target.checked,
                })
              }
            />
            <span>
              <strong>Email Notifications</strong>
              <small>Receive important updates through email.</small>
            </span>
          </label>

          <button className="page-primary-btn" disabled={savingSettings}>
            {savingSettings ? "Saving..." : "Save Preferences"}
          </button>
        </form>
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>Change Password</h3>
            <p>Choose a new password with at least 8 characters.</p>
          </div>
        </div>

        <form className="page-form" onSubmit={changePassword}>
          <div className="form-field">
            <label>Current Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, currentPassword: e.target.value })
              }
              required
            />
          </div>

          <div className="form-field">
            <label>New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
              required
            />
          </div>

          <button className="page-primary-btn" disabled={savingPassword}>
            {savingPassword ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
