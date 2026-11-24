
import { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyForm = {
  type: 'EXPENSE',
  amount: '',
  category: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
};

const getTransactions = (response) => {
  const body = response.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.transactions)) return body.transactions;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.data?.transactions)) return body.data.transactions;
  return [];
};

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const loadTransactions = async () => {
    setError('');

    try {
      const response = await api.get('/transactions');
      setTransactions(getTransactions(response));
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not load transactions. Please check the backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (Number(form.amount) <= 0) {
      setError('Please enter an amount greater than zero.');
      return;
    }

    const payload = {
      ...form,
      amount: Number(form.amount),
    };

    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
        setSuccess('Transaction updated successfully.');
      } else {
        await api.post('/transactions', payload);
        setSuccess('Transaction added successfully.');
      }

      resetForm();
      await loadTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not save transaction. Check your backend field names and route.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id || item.id);
    setForm({
      type: String(item.type || 'EXPENSE').toUpperCase(),
      amount: item.amount ?? '',
      category: item.category || '',
      description: item.description || '',
      date: item.date
        ? new Date(item.date).toISOString().slice(0, 10)
        : emptyForm.date,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (item) => {
    const id = item._id || item.id;
    if (!id) {
      setError('This transaction does not have a valid ID.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.delete(`/transactions/${id}`);
      setSuccess('Transaction deleted successfully.');
      await loadTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not delete transaction.'
      );
    }
  };

  const filteredTransactions = transactions.filter((item) => {
    const matchesType =
      filter === 'ALL' ||
      String(item.type).toUpperCase() === filter;

    const text = `${item.description || ''} ${item.category || ''}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  const totalIncome = transactions
    .filter((item) => String(item.type).toUpperCase() === 'INCOME')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalExpenses = transactions
    .filter((item) => String(item.type).toUpperCase() === 'EXPENSE')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="transactions-content">
      <div className="welcome-section">
        <div>
          <span className="section-eyebrow">MONEY MANAGEMENT</span>
          <h1>Transactions</h1>
          <p>Keep track of every rupee coming in and going out.</p>
        </div>
        <div className="welcome-date">✧ Transaction Manager</div>
      </div>

      {error && <div className="transaction-alert error-alert">{error}</div>}
      {success && <div className="transaction-alert success-alert">{success}</div>}

      <div className="transaction-summary">
        <div className="transaction-summary-card">
          <span>Total Income</span>
          <h3>{money(totalIncome)}</h3>
        </div>
        <div className="transaction-summary-card">
          <span>Total Expenses</span>
          <h3>{money(totalExpenses)}</h3>
        </div>
        <div className="transaction-summary-card">
          <span>Net Balance</span>
          <h3>{money(totalIncome - totalExpenses)}</h3>
        </div>
      </div>

      <div className="transaction-layout">
        <section className="dashboard-panel transaction-form-panel">
          <div className="panel-heading">
            <div>
              <span className="section-eyebrow">
                {editingId ? 'UPDATE RECORD' : 'NEW RECORD'}
              </span>
              <h3>{editingId ? 'Edit Transaction' : 'Add Transaction'}</h3>
            </div>
            <span className="summary-icon">＋</span>
          </div>

          <form onSubmit={handleSubmit} className="transaction-form">
            <label>Transaction Type</label>
            <div className="type-selector">
              <button
                type="button"
                className={form.type === 'INCOME' ? 'type-option selected-income' : 'type-option'}
                onClick={() => setForm({ ...form, type: 'INCOME' })}
              >
                ↗ Income
              </button>
              <button
                type="button"
                className={form.type === 'EXPENSE' ? 'type-option selected-expense' : 'type-option'}
                onClick={() => setForm({ ...form, type: 'EXPENSE' })}
              >
                ↘ Expense
              </button>
            </div>

            <label htmlFor="amount">Amount (₹)</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              value={form.amount}
              onChange={handleChange}
              required
            />

            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {(
                form.type === 'INCOME'
                  ? ['Salary', 'Business', 'Investment', 'Gift', 'Other']
                  : ['Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Health', 'Other']
              ).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <label htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="e.g. Monthly salary"
              value={form.description}
              onChange={handleChange}
              required
            />

            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />

            <button className="transaction-submit" type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Transaction'
                  : 'Save Transaction'}
            </button>

            {editingId && (
              <button
                className="transaction-cancel"
                type="button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </section>

        <section className="dashboard-panel transaction-list-panel">
          <div className="panel-heading">
            <div>
              <span className="section-eyebrow">YOUR RECORDS</span>
              <h3>All Transactions</h3>
            </div>
            <span className="panel-badge">{transactions.length} total</span>
          </div>

          <div className="transaction-filters">
            <input
              type="search"
              placeholder="Search description or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-transactions">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="empty-transactions">
              <div className="empty-icon">↔</div>
              <h4>No transactions found</h4>
              <p>Add your first income or expense using the form.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((item, index) => {
                    const isIncome =
                      String(item.type).toUpperCase() === 'INCOME';

                    return (
                      <tr key={item._id || item.id || index}>
                        <td>
                          <strong>{item.description || 'Transaction'}</strong>
                          <div className="transaction-date">
                            {item.date
                              ? new Date(item.date).toLocaleDateString('en-IN')
                              : '—'}
                          </div>
                        </td>
                        <td>{item.category || 'Other'}</td>
                        <td>
                          <span className={isIncome ? 'type-label income-label' : 'type-label expense-label'}>
                            {isIncome ? 'Income' : 'Expense'}
                          </span>
                        </td>
                        <td className={isIncome ? 'amount-income' : 'amount-expense'}>
                          {isIncome ? '+' : '-'}{money(item.amount)}
                        </td>
                        <td>
                          <div className="transaction-actions">
                            <button type="button" onClick={() => handleEdit(item)} aria-label="Edit">
                              ✎
                            </button>
                            <button type="button" onClick={() => handleDelete(item)} aria-label="Delete">
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
