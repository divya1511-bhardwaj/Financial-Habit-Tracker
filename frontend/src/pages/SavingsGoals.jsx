
import { useEffect, useState } from "react";
import api from "../api/axios";

function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [contributions, setContributions] = useState({});

  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    category: "General",
  });

  const loadGoals = async () => {
    try {
      setError("");
      const response = await api.get("/savings-goals");
      setGoals(response.data.goals || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load savings goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();

    const target = Number(form.targetAmount);

    if (!form.name.trim() || !Number.isFinite(target) || target <= 0 || !form.deadline) {
      setError("Please enter valid goal details.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await api.post("/savings-goals", {
        name: form.name.trim(),
        targetAmount: target,
        deadline: form.deadline,
        category: form.category,
      });

      setForm({
        name: "",
        targetAmount: "",
        deadline: "",
        category: "General",
      });

      setMessage("Savings goal created successfully!");
      await loadGoals();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create goal.");
    } finally {
      setSaving(false);
    }
  };

  const addContribution = async (goalId) => {
    const amount = Number(contributions[goalId]);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid contribution amount.");
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.post(`/savings-goals/${goalId}/contributions`, { amount });

      setContributions((previous) => ({
        ...previous,
        [goalId]: "",
      }));

      setMessage("Contribution added successfully!");
      await loadGoals();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add contribution.");
    }
  };

  const totalTarget = goals.reduce(
    (sum, goal) => sum + Number(goal.targetAmount || 0),
    0
  );

  const totalSaved = goals.reduce(
    (sum, goal) => sum + Number(goal.currentAmount || 0),
    0
  );

  const overallProgress = totalTarget
    ? Math.min(100, Math.round((totalSaved / totalTarget) * 100))
    : 0;

  const money = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  return (
    <div className="page-content savings-page">
      <div className="welcome-section">
        <div>
          <span className="section-eyebrow">PLAN • SAVE • ACHIEVE</span>
          <h1>Savings Goals</h1>
          <p>Set your targets and make steady progress towards them.</p>
        </div>
        <div className="welcome-date">
          <span>✦</span> Your future starts today
        </div>
      </div>

      <div className="stats-grid savings-stats">
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <p>Total Goals</p>
              <h3>{goals.length}</h3>
            </div>
            <div className="stat-icon stat-purple">◎</div>
          </div>
          <span className="stat-subtitle">Your savings targets</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <p>Total Saved</p>
              <h3>{money(totalSaved)}</h3>
            </div>
            <div className="stat-icon stat-green">₹</div>
          </div>
          <span className="stat-subtitle">Across all your goals</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <p>Target Amount</p>
              <h3>{money(totalTarget)}</h3>
            </div>
            <div className="stat-icon stat-yellow">◈</div>
          </div>
          <span className="stat-subtitle">Combined savings target</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <p>Overall Progress</p>
              <h3>{overallProgress}%</h3>
            </div>
            <div className="stat-icon stat-coral">↗</div>
          </div>
          <span className="stat-subtitle">Progress towards all goals</span>
        </div>
      </div>

      {error && <div className="page-alert error-alert">{error}</div>}
      {message && <div className="page-alert success-alert">{message}</div>}

      <div className="savings-layout">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="section-eyebrow">START SAVING</span>
              <h3>Create a Goal</h3>
            </div>
            <div className="goal-heading-icon">＋</div>
          </div>

          <form className="page-form" onSubmit={handleCreateGoal}>
            <label>Goal Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Buy a Laptop"
              maxLength={80}
              required
            />

            <label>Target Amount (₹)</label>
            <input
              type="number"
              name="targetAmount"
              value={form.targetAmount}
              onChange={handleChange}
              placeholder="e.g. 50000"
              min="1"
              step="any"
              required
            />

            <label>Deadline</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              min={new Date().toLocaleDateString("en-CA")}
              required
            />

            <label>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option>General</option>
              <option>Education</option>
              <option>Technology</option>
              <option>Travel</option>
              <option>Emergency Fund</option>
              <option>Personal</option>
            </select>

            <button className="page-primary-btn" disabled={saving}>
              {saving ? "Creating..." : "＋ Create Savings Goal"}
            </button>
          </form>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="section-eyebrow">YOUR TARGETS</span>
              <h3>My Savings Goals</h3>
            </div>
            <span className="panel-badge">{goals.length} Goals</span>
          </div>

          {loading ? (
            <div className="page-empty">Loading savings goals...</div>
          ) : goals.length === 0 ? (
            <div className="page-empty">
              <div className="empty-icon">◎</div>
              <h4>No savings goals yet</h4>
              <p>Create a goal and start saving towards something meaningful.</p>
            </div>
          ) : (
            <div className="goal-list">
              {goals.map((goal) => {
                const percentage = Math.min(
                  100,
                  Math.round(
                    (Number(goal.currentAmount || 0) /
                      Number(goal.targetAmount || 1)) *
                      100
                  )
                );

                return (
                  <div className="goal-card" key={goal._id}>
                    <div className="goal-card-top">
                      <div className="goal-item-icon">◎</div>
                      <div className="goal-title">
                        <h4>{goal.name}</h4>
                        <span>{goal.category || "General"}</span>
                      </div>
                      <span className="goal-percentage">{percentage}%</span>
                    </div>

                    <div className="goal-amount-row">
                      <strong>{money(goal.currentAmount)}</strong>
                      <span>of {money(goal.targetAmount)}</span>
                    </div>

                    <div className="goal-progress-track">
                      <div
                        className="goal-progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="goal-footer">
                      <span>
                        Deadline:{" "}
                        {new Date(goal.deadline).toLocaleDateString("en-IN")}
                      </span>
                      <span>{money(Math.max(0, goal.targetAmount - goal.currentAmount))} left</span>
                    </div>

                    <div className="contribution-row">
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        placeholder="Amount to add (₹)"
                        value={contributions[goal._id] || ""}
                        onChange={(e) =>
                          setContributions((previous) => ({
                            ...previous,
                            [goal._id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        className="contribution-btn"
                        onClick={() => addContribution(goal._id)}
                      >
                        + Add
                      </button>
                    </div>
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

export default SavingsGoals;
