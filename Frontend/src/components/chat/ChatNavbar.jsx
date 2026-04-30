// components/chat/ChatNavbar.jsx
const ChatNavbar = ({
  theme,
  user,
  searchQuery,
  onSearchChange,
  showSearch,
  onNavigateToProfile,
  onNavigateToSettings,
  onLogout,
  onOpenSidebar,
}) => {
  const initials = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div
      className="dashboard-navbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '16px 22px',
        background: theme.surface,
        borderBottom: `1px solid ${theme.border}`,
        boxShadow: `0 10px 32px ${theme.shadow}`,
      }}
    >
      {/* Brand */}
      <div
        className="dashboard-brand"
        style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}
      >
        <button
          onClick={onOpenSidebar}
          className="mobile-menu-btn"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div
          className="dashboard-brand-badge"
          style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: theme.accent, color: theme.accentText,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <div className="dashboard-brand-copy" style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 500 }}>
            Messages
          </h1>
          <p style={{ margin: '4px 0 0', color: theme.muted, fontSize: '12px' }}>
            Search users and continue your chat
          </p>
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div
          className="dashboard-search"
          style={{
            flex: 1, maxWidth: '420px', display: 'flex', alignItems: 'center',
            gap: '10px', background: theme.subtle, border: `1px solid ${theme.border}`,
            borderRadius: '999px', padding: '12px 16px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.muted} strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="dashboard-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search users..."
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontSize: '14px', color: theme.text, fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div
        className="dashboard-actions"
        style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
      >
        <button
          className="dashboard-profile-button"
          onClick={onNavigateToProfile}
          title="Profile"
          style={{
            width: '40px', height: '40px', borderRadius: '50%', border: 'none',
            background: theme.accent, color: theme.accentText, cursor: 'pointer', fontWeight: 700,
          }}
        >
          {initials}
        </button>

        <button
          className="dashboard-settings-button"
          onClick={onNavigateToSettings}
          title="Settings"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px', borderRadius: '10px', color: theme.muted,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <button
          className="dashboard-logout-button"
          onClick={onLogout}
          title="Logout"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px', borderRadius: '10px', color: theme.muted,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatNavbar;
