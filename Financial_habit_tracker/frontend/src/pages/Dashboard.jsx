
import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div>
          <p>{title}</p>
          <h3>{formatCurrency(value)}</h3>
        </div>
        <div className={`stat-icon ${color}`}>{icon}</div>
      </div>
      <span className="stat-subtitle">{subtitle}</span>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data.data || response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Unable to load dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const income = Number(data?.totalIncome) || 0;
  const expenses = Number(data?.totalExpenses) || 0;
  const savings = Number(data?.netSavings) || 0;
  const transactions = Array.isArray(data?.recentTransactions)
    ? data.recentTransactions
    : [];

  const chartData = [
    { name: 'Income', amount: income },
    { name: 'Expenses', amount: expenses },
    { name: 'Savings', amount: savings },
  ];

  if (loading) {
    return <div className="dashboard-loading">Loading your financial overview...</div>;
  }

  return (
    <div className="dashboard-content">
      <section className="welcome-section">
        <div>
          <span className="section-eyebrow">YOUR MONEY AT A GLANCE</span>
          <h1>Welcome back, {JSON.parse(localStorage.getItem('user') || '{}').name?.split(' ')[0] || 'there'}! <span>✦</span></h1>
          <p>Here is what's happening with your finances.</p>
        </div>

        <div className="welcome-date">
          <span>✧</span> Financial Overview
        </div>
      </section>

      {error && (
        <div className="dashboard-error">
          {error}
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          title="Total Income"
          value={income}
          subtitle="Your recorded income"
          icon="↗"
          color="stat-purple"
        />

        <StatCard
          title="Total Expenses"
          value={expenses}
          subtitle="Your recorded expenses"
          icon="↘"
          color="stat-coral"
        />

        <StatCard
          title="Net Savings"
          value={savings}
          subtitle="Income minus expenses"
          icon="◎"
          color="stat-green"
        />

        <StatCard
          title="Transactions"
          value={transactions.length}
          subtitle="Recent recorded entries"
          icon="▤"
          color="stat-yellow"
        />
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel analytics-panel">
          <div className="panel-heading">
            <div>
              <span className="section-eyebrow">FINANCIAL SUMMARY</span>
              <h3>Income & Expenses</h3>
            </div>
            <span className="panel-badge">Overview</span>
          </div>

          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 10, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee8f3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#A882DD" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="chart-note">
            This chart compares the totals returned by your dashboard API.
          </p>
        </div>

        <div className="dashboard-panel summary-panel">
          <div className="panel-heading">
            <div>
              <span className="section-eyebrow">YOUR PROGRESS</span>
              <h3>Savings Snapshot</h3>
            </div>
            <div className="summary-icon">✧</div>
          </div>

          <div className="savings-highlight">
            <span>Net Savings</span>
            <h2>{formatCurrency(savings)}</h2>
          </div>

          <div className="summary-row">
            <span><i className="legend-dot income-dot"></i> Income</span>
            <strong>{formatCurrency(income)}</strong>
          </div>

          <div className="summary-row">
            <span><i className="legend-dot expense-dot"></i> Expenses</span>
            <strong>{formatCurrency(expenses)}</strong>
          </div>

          <div className="summary-footer">
            Keep recording your transactions to understand your financial progress.
          </div>
        </div>
      </section>

      <section className="dashboard-panel transactions-panel">
        <div className="panel-heading">
          <div>
            <span className="section-eyebrow">YOUR ACTIVITY</span>
            <h3>Recent Transactions</h3>
          </div>
          <span className="panel-badge">{transactions.length} records</span>
        </div>

        {transactions.length > 0 ? (
          <div className="table-responsive">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item, index) => {
                  const isIncome = String(item.type || '').toLowerCase() === 'income';

                  return (
                    <tr key={item._id || item.id || index}>
                      <td>
                        <div className="transaction-name">
                          <span className="transaction-symbol">
                            {isIncome ? '↗' : '↘'}
                          </span>
                          {item.description || item.title || 'Transaction'}
                        </div>
                      </td>
                      <td>{item.category || 'Other'}</td>
                      <td>
                        {item.date
                          ? new Date(item.date).toLocaleDateString('en-IN')
                          : '—'}
                      </td>
                      <td className={isIncome ? 'amount-income' : 'amount-expense'}>
                        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-transactions">
            <div className="empty-icon">↔</div>
            <h4>No transactions yet</h4>
            <p>Your recent income and expenses will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
}
