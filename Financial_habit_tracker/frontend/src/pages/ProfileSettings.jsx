
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ProfileSettings() {
  const [profile, setProfile] = useState(null);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const response = await api.get("/profile");

        setProfile(response.data.user);
        setError("");
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const changePassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!passwords.currentPassword || !passwords.newPassword) {
      setError("Please enter both passwords.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    if (passwords.currentPassword === passwords.newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    try {
      setSavingPassword(true);

      const response = await api.patch(
        "/profile/change-password",
        passwords
      );

      setPasswords({
        currentPassword: "",
        newPassword: "",
      });

      setShowCurrentPassword(false);
      setShowNewPassword(false);

      setMessage(
        response.data.message || "Password changed successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to change password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-content">
        <div className="page-alert error">
          {error || "Profile information is unavailable."}
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">

      <div className="welcome-section">
        <div>
          <h1>My Profile</h1>
          <p>View your account information and manage your password.</p>
        </div>
      </div>

      {error && (
        <div className="page-alert error">{error}</div>
      )}

      {message && (
        <div className="page-alert success">{message}</div>
      )}

      {/* PROFILE INFORMATION */}

      <div className="dashboard-panel">

        <div className="panel-heading">
          <div>
            <h3>Personal Information</h3>
            <p>Your registered account details.</p>
          </div>
        </div>

        <div className="profile-details-grid">

          <div className="profile-detail">
            <span>Full Name</span>
            <strong>{profile.name || "Not available"}</strong>
          </div>

          <div className="profile-detail">
            <span>Email Address</span>
            <strong>{profile.email || "Not available"}</strong>
          </div>

          <div className="profile-detail">
            <span>Account Role</span>
            <strong>{profile.role || "USER"}</strong>
          </div>

          <div className="profile-detail">
            <span>Account Status</span>
            <strong>
              {profile.active ? "Active" : "Inactive"}
            </strong>
          </div>

          <div className="profile-detail">
            <span>Account Created</span>
            <strong>{formatDate(profile.createdAt)}</strong>
          </div>

          <div className="profile-detail">
            <span>Last Updated</span>
            <strong>{formatDate(profile.updatedAt)}</strong>
          </div>

        </div>

      </div>

      {/* CHANGE PASSWORD */}

      <div className="dashboard-panel">

        <div className="panel-heading">
          <div>
            <h3>Change Password</h3>
            <p>Update your account password securely.</p>
          </div>
        </div>

        <form className="page-form" onSubmit={changePassword}>

          <div className="form-field">
            <label>Current Password</label>

            <div className="password-input-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                autoComplete="current-password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="Enter current password"
                required
              />

              <button
                type="button"
                className="password-toggle-btn"
                onClick={() =>
                  setShowCurrentPassword(!showCurrentPassword)
                }
                aria-label={
                  showCurrentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
              >
                {showCurrentPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label>New Password</label>

            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Enter new password"
                required
              />

              <button
                type="button"
                className="password-toggle-btn"
                onClick={() =>
                  setShowNewPassword(!showNewPassword)
                }
                aria-label={
                  showNewPassword
                    ? "Hide new password"
                    : "Show new password"
                }
              >
                {showNewPassword ? "🙈" : "👁"}
              </button>
            </div>

            <small>Minimum 8 characters required.</small>
          </div>

          <button
            type="submit"
            className="page-primary-btn"
            disabled={savingPassword}
          >
            {savingPassword ? "Updating..." : "Change Password"}
          </button>

        </form>

      </div>

    </div>
  );
}
