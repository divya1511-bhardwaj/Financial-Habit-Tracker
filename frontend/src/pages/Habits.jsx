
import { useEffect, useState } from "react";
import api from "../api/axios";

function Habits() {
  const [habits, setHabits] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    frequency: "DAILY",
  });

  const loadHabits = async () => {
    try {
      setError("");
      const [habitsResponse, progressResponse] = await Promise.all([
        api.get("/habits"),
        api.get("/habits/progress"),
      ]);

      setHabits(habitsResponse.data.habits || []);
      setProgress(progressResponse.data.progress || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load habits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter a habit name.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await api.post("/habits", {
        name: form.name.trim(),
        description: form.description.trim(),
        frequency: form.frequency,
      });

      setForm({ name: "", description: "", frequency: "DAILY" });
      setMessage("Habit added successfully!");
      await loadHabits();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add habit.");
    } finally {
      setSaving(false);
    }
  };

  const completeHabit = async (id) => {
    try {
      setError("");
      setMessage("");

      await api.patch(`/habits/${id}/complete`);
      setMessage("Habit completed for today!");
      await loadHabits();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to complete habit.");
    }
  };

  const completedCount = progress.filter(
    (item) => item.completedToday
  ).length;

  const completionRate = progress.length
    ? Math.round((completedCount / progress.length) * 100)
    : 0;

  const frequencyLabel = (frequency) =>
    frequency.charAt(0) + frequency.slice(1).toLowerCase();

  return (
    <div className="page-content habits-page">
      <div className="welcome-section">
        <div>
          <span className="section-eyebrow">BUILD BETTER ROUTINES</span>
          <h1>Daily Habits</h1>
          <p>Small daily actions create meaningful financial habits.</p>
        </div>
        <div className="welcome-date">
          <span>✦</span> Your daily progress
        </div>
      </div>

      <div className="stats-grid habits-stats">
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <p>Total Habits</p>
              <h3>{habits.length}</h3>
            </div>
            <div className="stat-icon stat-purple">✦</div>
          </div>
          <span className="stat-subtitle">Your active routines</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <p>Completed Today</p>
              <h3>{completedCount}</h3>
            </div>
            <div className="stat-icon stat-green">✓</div>
          </div>
          <span className="stat-subtitle">Habits completed today</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <p>Today's Progress</p>
              <h3>{completionRate}%</h3>
            </div>
            <div className="stat-icon stat-yellow">◷</div>
          </div>
          <span className="stat-subtitle">Based on your active habits</span>
        </div>
      </div>

      {error && <div className="page-alert error-alert">{error}</div>}
      {message && <div className="page-alert success-alert">{message}</div>}

      <div className="habits-layout">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="section-eyebrow">NEW ROUTINE</span>
              <h3>Create a Habit</h3>
            </div>
            <div className="habit-heading-icon">＋</div>
          </div>

          <form className="page-form" onSubmit={handleSubmit}>
            <label>Habit Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Save ₹100 daily"
              maxLength={80}
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Write a short description..."
              rows="3"
            />

            <label>Frequency</label>
            <select
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>

            <button className="page-primary-btn" disabled={saving}>
              {saving ? "Adding..." : "＋ Add Habit"}
            </button>
          </form>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="section-eyebrow">YOUR ROUTINES</span>
              <h3>My Habits</h3>
            </div>
            <span className="panel-badge">{habits.length} Habits</span>
          </div>

          {loading ? (
            <div className="page-empty">Loading habits...</div>
          ) : habits.length === 0 ? (
            <div className="page-empty">
              <div className="empty-icon">✦</div>
              <h4>No habits added yet</h4>
              <p>Create your first habit to start tracking your progress.</p>
            </div>
          ) : (
            <div className="habit-list">
              {habits.map((habit) => {
                const itemProgress = progress.find(
                  (item) => item.id === habit._id
                );
                const completed = itemProgress?.completedToday || false;

                return (
                  <div className="habit-item" key={habit._id}>
                    <div className="habit-item-icon">✧</div>

                    <div className="habit-item-info">
                      <h4>{habit.name}</h4>
                      <p>{habit.description || "Keep building this routine."}</p>
                      <div className="habit-meta">
                        <span>{frequencyLabel(habit.frequency)}</span>
                        <span>
                          {itemProgress?.totalCompletions || 0} total completions
                        </span>
                      </div>
                    </div>

                    <button
                      className={`habit-complete-btn ${
                        completed ? "completed" : ""
                      }`}
                      disabled={completed}
                      onClick={() => completeHabit(habit._id)}
                    >
                      {completed ? "✓ Done" : "Mark Done"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Habits;
