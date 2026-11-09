
import { useEffect, useState } from "react";
import api from "../api/axios";

const statusLabel = (status) =>
  (status || "OPEN").replaceAll("_", " ");

export default function Feedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [form, setForm] = useState({
    category: "SUGGESTION",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get("/feedback/mine");
      const data = response.data;
      setFeedbackList(
        Array.isArray(data) ? data : data.feedback || []
      );
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load feedback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.message.trim()) {
      setError("Please enter your feedback.");
      return;
    }

    try {
      setSaving(true);
      await api.post("/feedback", {
        category: form.category,
        message: form.message.trim(),
      });
      setForm({ category: "SUGGESTION", message: "" });
      setMessage("Your feedback has been submitted.");
      await loadFeedback();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit feedback.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      <div className="welcome-section">
        <div>
          <h1>Feedback</h1>
          <p>Share suggestions, report issues and help us improve.</p>
        </div>
      </div>

      {error && <div className="page-alert error">{error}</div>}
      {message && <div className="page-alert success">{message}</div>}

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>Send Feedback</h3>
            <p>Tell us about your experience</p>
          </div>
        </div>

        <form className="page-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Feedback Category</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option value="SUGGESTION">Suggestion</option>
              <option value="BUG">Bug Report</option>
              <option value="COMPLAINT">Complaint</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-field">
            <label>Your Message</label>
            <textarea
              rows="5"
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              placeholder="Write your feedback here..."
              required
            />
          </div>

          <button className="page-primary-btn" disabled={saving}>
            {saving ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>My Feedback History</h3>
            <p>Check the status of your submissions</p>
          </div>
        </div>

        {loading ? (
          <p>Loading feedback...</p>
        ) : feedbackList.length === 0 ? (
          <div className="page-empty">You have not submitted feedback yet.</div>
        ) : (
          <div className="feedback-list">
            {feedbackList.map((item) => (
              <div className="feedback-item" key={item._id}>
                <div className="feedback-item-top">
                  <strong>{item.category}</strong>
                  <span className={`feedback-status ${(item.status || "OPEN").toLowerCase()}`}>
                    {statusLabel(item.status)}
                  </span>
                </div>
                <p>{item.message}</p>
                {item.adminResponse && (
                  <div className="admin-response">
                    <strong>Admin response</strong>
                    <p>{item.adminResponse}</p>
                  </div>
                )}
                <small>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("en-IN")
                    : ""}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
