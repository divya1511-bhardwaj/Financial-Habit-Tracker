
import { useEffect, useState } from "react";
import api from "../api/axios";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const initialForm = {
  name: "",
  type: "ASSET",
  category: "",
  amount: "",
};

export default function Wealth() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
  });
  const [snapshots, setSnapshots] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadWealthData = async () => {
    try {
      setLoading(true);
      const [itemsRes, summaryRes, snapshotsRes] = await Promise.all([
        api.get("/wealth/items"),
        api.get("/wealth/summary"),
        api.get("/wealth/snapshots"),
      ]);

      setItems(itemsRes.data.items || []);
      setSummary(summaryRes.data);
      setSnapshots(snapshotsRes.data.snapshots || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load wealth information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWealthData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const amount = Number(form.amount);

    if (
      !form.name.trim() ||
      !form.category.trim() ||
      form.amount === "" ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      setError("Please enter valid item details and amount.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      type: form.type,
      category: form.category.trim(),
      amount,
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/wealth/items/${editingId}`, payload);
        setMessage("Wealth item updated successfully.");
      } else {
        await api.post("/wealth/items", payload);
        setMessage("Wealth item added successfully.");
      }

      setForm(initialForm);
      setEditingId(null);
      await loadWealthData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save wealth item.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      type: item.type,
      category: item.category,
      amount: String(item.amount),
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const saveSnapshot = async () => {
    setError("");
    setMessage("");

    try {
      setSaving(true);
      await api.post("/wealth/snapshots");
      setMessage("Today's wealth snapshot saved successfully.");
      await loadWealthData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save snapshot.");
    } finally {
      setSaving(false);
    }
  };

  const latestSnapshot = snapshots[snapshots.length - 1];

  return (
    <div className="page-content">
      <div className="welcome-section">
        <div>
          <h1>Wealth Analytics</h1>
          <p>Manage your assets, liabilities and overall net worth.</p>
        </div>
        <button
          className="page-primary-btn"
          onClick={saveSnapshot}
          disabled={saving || loading}
        >
          {saving ? "Please wait..." : "Save Today's Snapshot"}
        </button>
      </div>

      {error && <div className="page-alert error">{error}</div>}
      {message && <div className="page-alert success">{message}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Assets</span>
          <h2>{money(summary.totalAssets)}</h2>
        </div>
        <div className="stat-card">
          <span>Total Liabilities</span>
          <h2>{money(summary.totalLiabilities)}</h2>
        </div>
        <div className="stat-card">
          <span>Net Worth</span>
          <h2>{money(summary.netWorth)}</h2>
        </div>
        <div className="stat-card">
          <span>Latest Snapshot</span>
          <h2 className="wealth-snapshot-date">
            {latestSnapshot?.snapshotDate
              ? new Date(latestSnapshot.snapshotDate).toLocaleDateString("en-IN")
              : "Not saved"}
          </h2>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>{editingId ? "Update Wealth Item" : "Add Wealth Item"}</h3>
            <p>Add an asset or liability to calculate your net worth.</p>
          </div>
        </div>

        <form className="page-form wealth-item-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Item Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Savings Account"
              required
            />
          </div>

          <div className="form-field">
            <label>Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="ASSET">Asset</option>
              <option value="LIABILITY">Liability</option>
            </select>
          </div>

          <div className="form-field">
            <label>Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Savings, Loan, Property"
              required
            />
          </div>

          <div className="form-field">
            <label>Amount (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="wealth-form-actions">
            <button className="page-primary-btn" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Item"
                  : "Add Item"}
            </button>

            {editingId && (
              <button
                type="button"
                className="wealth-cancel-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>My Wealth Items</h3>
            <p>Your saved assets and liabilities</p>
          </div>
        </div>

        {loading ? (
          <p>Loading wealth items...</p>
        ) : items.length === 0 ? (
          <div className="page-empty">No wealth items added yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>
                      <span className={`wealth-type ${item.type.toLowerCase()}`}>
                        {item.type}
                      </span>
                    </td>
                    <td>{item.category}</td>
                    <td>{money(item.amount)}</td>
                    <td>
                      <button
                        className="wealth-edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>Wealth Snapshot History</h3>
            <p>Your saved daily net worth records</p>
          </div>
        </div>

        {snapshots.length === 0 ? (
          <div className="page-empty">
            No snapshots saved. Select "Save Today's Snapshot" to create one.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Assets</th>
                  <th>Liabilities</th>
                  <th>Net Worth</th>
                </tr>
              </thead>
              <tbody>
                {[...snapshots].reverse().map((snapshot) => (
                  <tr key={snapshot._id}>
                    <td>
                      {new Date(snapshot.snapshotDate).toLocaleDateString("en-IN")}
                    </td>
                    <td>{money(snapshot.totalAssets)}</td>
                    <td>{money(snapshot.totalLiabilities)}</td>
                    <td>{money(snapshot.netWorth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
