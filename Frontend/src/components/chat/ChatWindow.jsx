// components/chat/ChatWindow.jsx
import { useEffect, useRef } from 'react';

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const isToday = date.toDateString() === new Date().toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ChatWindow = ({
  theme,
  selectedUser,
  messages,
  newMessage,
  loading,
  sending,
  isConnected,
  currentUserEmail,
  isCompactMobile,
  onNewMessageChange,
  onSendMessage,
  onBack,
}) => {
  const messagesEndRef = useRef(null);
  const initials = selectedUser?.name?.charAt(0).toUpperCase() || '?';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: theme.muted, textAlign: 'center',
        padding: '20px', background: theme.subtle,
      }}>
        <div>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={theme.border} strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p style={{ marginTop: '16px', fontSize: '14px' }}>
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <div
        className="dashboard-chat-header"
        style={{
          padding: '18px 22px', borderBottom: `1px solid ${theme.border}`,
          background: theme.surface, display: 'flex', alignItems: 'center', gap: '12px',
        }}
      >
        {isCompactMobile && (
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', borderRadius: '10px', color: theme.text,
              display: 'flex', alignItems: 'center', flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
        )}

        <div style={{
          width: '46px', height: '46px', borderRadius: '14px',
          background: theme.pageBackground, color: theme.text,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
        }}>
          {initials}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme.text }}>
            {selectedUser.name}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: newMessage.trim() ? theme.accent : theme.muted, minHeight: '16px' }}>
            {newMessage.trim() ? 'Typing...' : '\u00A0'}
          </p>
        </div>

        <span
          className="dashboard-chat-status"
          style={{
            fontSize: '11px', padding: '5px 10px', borderRadius: '999px',
            background: isConnected ? theme.subtle : theme.pageBackground,
            color: isConnected ? theme.accent : theme.muted,
          }}
        >
          {isConnected ? 'Connected' : 'Reconnecting...'}
        </span>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px', background: theme.subtle }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: theme.muted, padding: '40px' }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: theme.muted, padding: '60px 20px' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={theme.border} strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p style={{ marginTop: '16px', fontSize: '14px' }}>No messages yet</p>
            <p style={{ fontSize: '12px' }}>Send a message to start chatting!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.senderEmail === currentUserEmail;
            const showDate =
              idx === 0 ||
              new Date(msg.timestamp).toDateString() !==
                new Date(messages[idx - 1]?.timestamp).toDateString();

            return (
              <div key={msg.id || idx}>
                {showDate && (
                  <div style={{ textAlign: 'center', margin: '24px 0 16px' }}>
                    <span style={{
                      fontSize: '11px', color: theme.muted, background: theme.surface,
                      padding: '4px 12px', borderRadius: '20px',
                    }}>
                      {new Date(msg.timestamp).toDateString() === new Date().toDateString()
                        ? 'TODAY'
                        : new Date(msg.timestamp)
                            .toLocaleDateString([], { month: 'long', day: 'numeric' })
                            .toUpperCase()}
                    </span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    maxWidth: '70%', padding: '12px 16px',
                    borderRadius: isOwn ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    background: isOwn ? theme.accent : theme.surface,
                    color: isOwn ? theme.accentText : theme.text,
                    boxShadow: `0 10px 24px ${theme.shadow}`,
                    ...(msg.error && { border: '1px solid #f44336' }),
                    opacity: msg.isTemp ? 0.7 : 1,
                  }}>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {msg.content}
                    </p>
                    <p style={{ margin: '5px 0 0', fontSize: '10px', opacity: 0.7, textAlign: 'right' }}>
                      {msg.isTemp ? 'Sending...' : formatTime(msg.timestamp)}
                      {msg.error && <span style={{ marginLeft: '8px', color: '#f44336' }}>Failed</span>}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <form
        className="dashboard-composer"
        onSubmit={onSendMessage}
        style={{
          padding: '16px 20px', background: theme.surface,
          borderTop: `1px solid ${theme.border}`,
          display: 'flex', gap: '12px',
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onNewMessageChange(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          style={{
            flex: 1, padding: '13px 16px', border: `1px solid ${theme.border}`,
            borderRadius: '999px', outline: 'none',
            fontFamily: "'DM Sans', sans-serif", fontSize: '14px',
            background: theme.subtle, color: theme.text,
          }}
        />
        <button
          className="dashboard-send-button"
          type="submit"
          disabled={sending || !newMessage.trim()}
          style={{
            background: theme.accent, border: 'none', borderRadius: '999px',
            padding: '0 20px', color: theme.accentText,
            cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
            opacity: sending || !newMessage.trim() ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <span style={{ fontSize: '14px' }}>Send</span>
        </button>
      </form>
    </>
  );
};

export default ChatWindow;
