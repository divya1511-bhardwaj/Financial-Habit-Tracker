
import { useState } from 'react';

export default function Topbar() {
  const [search, setSearch] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const initials = user.name
    ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="topbar">
      <div className="topbar-heading">
        <span className="topbar-eyebrow">YOUR FINANCIAL SPACE</span>
        <h2>Overview</h2>
      </div>

      <div className="topbar-actions">
        {/* <div className="topbar-search">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search anything..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div> */}

        {/* <button className="topbar-icon" type="button" aria-label="Notifications">
          ♧
          <span className="notification-dot"></span>
        </button> */}

        <div className="topbar-profile">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <strong>{user.name || 'User'}</strong>
            <span>{user.role || 'Member'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
