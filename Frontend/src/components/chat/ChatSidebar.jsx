// components/chat/ChatSidebar.jsx

const formatLastMessageTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ChatSidebar = ({
  theme,
  users,
  selectedUser,
  searchQuery,
  isCompactMobile,
  mobileMenuOpen,
  onSelectUser,
  onNavigateToSettings,
}) => {
  const initials = (name) => name?.charAt(0).toUpperCase() || '?';

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div
      className={`sidebar ${mobileMenuOpen ? 'open' : ''} ${isCompactMobile ? 'sidebar--mobile-page' : ''}`}
      style={{
        width: '320px',
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '28px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        boxShadow: `0 18px 42px ${theme.shadow}`,
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 20px 14px', borderBottom: `1px solid ${theme.border}` }}>
        <p style={{
          margin: 0, fontSize: '11px', textTransform: 'uppercase',
          letterSpacing: '0.12em', color: theme.muted,
        }}>
          {searchQuery.trim() ? 'Results' : 'Direct'}
        </p>
      </div>

      {/* User List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {filteredUsers.length === 0 ? (
          <p style={{ textAlign: 'center', color: theme.muted, padding: '40px 20px' }}>
            {searchQuery.trim() ? 'No user found' : 'No other users found'}
          </p>
        ) : (
          filteredUsers.map((otherUser) => (
            <div
              key={otherUser.id}
              onClick={() => onSelectUser(otherUser)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px', borderRadius: '18px', cursor: 'pointer', marginBottom: '8px',
                background: selectedUser?.id === otherUser.id ? theme.subtle : 'transparent',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedUser?.id !== otherUser.id)
                  e.currentTarget.style.background = theme.subtle;
              }}
              onMouseLeave={(e) => {
                if (selectedUser?.id !== otherUser.id)
                  e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{
                width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
                background: theme.pageBackground, color: theme.text,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}>
                {initials(otherUser.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                  <p style={{
                    margin: 0, fontWeight: 600, color: theme.text,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {otherUser.name}
                  </p>
                  {otherUser.lastMessageTime && (
                    <span style={{ fontSize: '10px', color: theme.muted, flexShrink: 0 }}>
                      {formatLastMessageTime(otherUser.lastMessageTime)}
                    </span>
                  )}
                </div>
                <p style={{
                  margin: '4px 0 0', fontSize: '13px', color: theme.muted,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {otherUser.lastMessage || 'Click to start chatting'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Settings Button */}
      <div style={{ padding: '12px', borderTop: `1px solid ${theme.border}` }}>
        <button
          type="button"
          onClick={onNavigateToSettings}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 14px', borderRadius: '18px', border: 'none',
            background: theme.subtle, color: theme.text, cursor: 'pointer', textAlign: 'left',
          }}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: theme.pageBackground,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>Settings</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: theme.muted }}>
              Theme and password options
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
