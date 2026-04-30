import { useState, useEffect, useRef, useCallback } from 'react';
import { profileApi, chatApi, session } from '../lib/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

window.global = window;

const defaultTheme = {
  pageBackground: '#f5f3ef',
  surface: '#ffffff',
  subtle: '#faf7f2',
  border: '#e8e0d6',
  accent: '#111111',
  accentText: '#ffffff',
  muted: '#8d8479',
  text: '#111111',
  shadow: 'rgba(24, 18, 12, 0.08)',
};

const Dashboard = ({
  theme = defaultTheme,
  user,
  onLogout,
  onNavigateToProfile,
  onNavigateToSettings,
}) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCompactMobile, setIsCompactMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false
  );
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      setIsCompactMobile(window.innerWidth <= 640);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const userList = await profileApi.listUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  const fetchConversation = useCallback(async (otherUser) => {
    if (!otherUser) return;

    setLoading(true);
    try {
      const conversation = await chatApi.getConversation(otherUser.email);
      const sorted = [...conversation].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      setMessages(sorted);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    const token = session.getToken();

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);

        client.subscribe('/user/queue/messages', (message) => {
          try {
            const receivedMsg = JSON.parse(message.body);

            setMessages((prev) => {
              const exists = prev.some(
                (item) =>
                  item.id === receivedMsg.id ||
                  (item.timestamp === receivedMsg.timestamp &&
                    item.senderEmail === receivedMsg.senderEmail &&
                    item.content === receivedMsg.content)
              );

              if (exists) return prev;
              if (selectedUser && receivedMsg.senderEmail === selectedUser.email) {
                return [...prev, receivedMsg];
              }

              return prev;
            });

            setUsers((prevUsers) =>
              prevUsers.map((item) =>
                item.email === receivedMsg.senderEmail
                  ? {
                      ...item,
                      lastMessage: receivedMsg.content,
                      lastMessageTime: receivedMsg.timestamp,
                    }
                  : item
              )
            );
          } catch (err) {
            console.error('Failed to parse message:', err);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setIsConnected(false);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client && client.connected) {
        client.deactivate();
      }
    };
  }, [selectedUser]);

  const sendMessageViaWebSocket = useCallback((message) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.private',
        body: JSON.stringify(message),
      });
      return true;
    }

    return false;
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || sending) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    setNewMessage('');
    setSending(true);

    const tempMessage = {
      id: tempId,
      senderEmail: user.email,
      receiverEmail: selectedUser.email,
      content: messageContent,
      timestamp: new Date().toISOString(),
      type: 'CHAT',
      isTemp: true,
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await chatApi.sendMessage({
        receiverEmail: selectedUser.email,
        content: messageContent,
      });

      setMessages((prev) => prev.filter((item) => item.id !== tempId));

      if (response && response.data) {
        setMessages((prev) => [...prev, response.data]);
      } else {
        await fetchConversation(selectedUser);
      }

      sendMessageViaWebSocket({
        senderEmail: user.email,
        receiverEmail: selectedUser.email,
        content: messageContent,
        type: 'CHAT',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) =>
        prev.map((item) =>
          item.id === tempId ? { ...item, error: true, isTemp: false } : item
        )
      );
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSelectUser = async (otherUser) => {
    setSelectedUser(otherUser);
    setMobileMenuOpen(false);
    await fetchConversation(otherUser);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setMessages([]);
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getUserInitials = (name) => name?.charAt(0).toUpperCase() || '?';

  const filteredUsers = users.filter((otherUser) =>
    otherUser.name?.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );
  const showMobileListPage = isCompactMobile && !selectedUser;
  const showSidebarPanel = !isCompactMobile || !selectedUser;
  const showChatPanel = !isCompactMobile || Boolean(selectedUser);

  useEffect(() => {
    fetchUsers();
    const cleanup = connectWebSocket();

    return () => {
      if (cleanup) cleanup();
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [fetchUsers, connectWebSocket]);

  useEffect(() => {
    if (isCompactMobile) {
      setMobileMenuOpen(false);
    }
  }, [isCompactMobile]);

  return (
    <div className="dashboard-page" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: theme.pageBackground,
      fontFamily: "'DM Sans', sans-serif",
      color: theme.text,
      overflow: 'hidden',
    }}>
      <div className="dashboard-navbar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '16px 22px',
        background: theme.surface,
        borderBottom: `1px solid ${theme.border}`,
        boxShadow: `0 10px 32px ${theme.shadow}`,
      }}>
        <div className="dashboard-brand" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: 0,
          flex: 1,
        }}>
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
            }}
            className="mobile-menu-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="dashboard-brand-badge" style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: theme.accent,
            color: theme.accentText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {getUserInitials(user?.name)}
          </div>

          <div className="dashboard-brand-copy" style={{ minWidth: 0 }}>
            <h1 style={{
              margin: 0,
              fontFamily: "'Playfair Display', serif",
              fontSize: '22px',
              fontWeight: 500,
            }}>
              Messages
            </h1>
            <p style={{
              margin: '4px 0 0',
              color: theme.muted,
              fontSize: '12px',
            }}>
              Search users and continue your chat
            </p>
          </div>
        </div>

        <div className="dashboard-search" style={{
          flex: 1,
          maxWidth: '420px',
          display: showMobileListPage || !isCompactMobile ? 'flex' : 'none',
          alignItems: 'center',
          gap: '10px',
          background: theme.subtle,
          border: `1px solid ${theme.border}`,
          borderRadius: '999px',
          padding: '12px 16px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.muted} strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="dashboard-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '14px',
              color: theme.text,
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>

        <div className="dashboard-actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}>
          <button
            className="dashboard-profile-button"
            onClick={onNavigateToProfile}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: theme.accent,
              color: theme.accentText,
              cursor: 'pointer',
              fontWeight: 700,
            }}
            title="Profile"
          >
            {getUserInitials(user?.name)}
          </button>
          <button
            className="dashboard-logout-button"
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '10px',
              color: theme.muted,
            }}
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {!isCompactMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 998,
          }}
        />
      )}

      <div className={`dashboard-layout ${showMobileListPage ? 'dashboard-layout--mobile-list' : ''} ${isCompactMobile && selectedUser ? 'dashboard-layout--mobile-chat' : ''}`} style={{
        flex: 1,
        display: 'flex',
        minHeight: 0,
        padding: '18px',
        gap: '18px',
      }}>
        {showSidebarPanel && (
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
            <div style={{
              padding: '20px 20px 14px',
              borderBottom: `1px solid ${theme.border}`,
            }}>
              <p style={{
                margin: 0,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: theme.muted,
              }}>
                {searchQuery.trim() ? 'Results' : 'Direct'}
              </p>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '10px 12px',
            }}>
              {filteredUsers.length === 0 ? (
                <p style={{ textAlign: 'center', color: theme.muted, padding: '40px 20px' }}>
                  {searchQuery.trim() ? 'No user found' : 'No other users found'}
                </p>
              ) : (
                filteredUsers.map((otherUser) => (
                  <div
                    key={otherUser.id}
                    onClick={() => handleSelectUser(otherUser)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '18px',
                      cursor: 'pointer',
                      background:
                        selectedUser?.id === otherUser.id ? theme.subtle : 'transparent',
                      transition: 'background 0.2s',
                      marginBottom: '8px',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedUser?.id !== otherUser.id) {
                        e.currentTarget.style.background = theme.subtle;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedUser?.id !== otherUser.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: theme.pageBackground,
                      color: theme.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {getUserInitials(otherUser.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: '8px',
                      }}>
                        <p style={{
                          margin: 0,
                          fontWeight: 600,
                          color: theme.text,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {otherUser.name}
                        </p>
                        {otherUser.lastMessageTime && (
                          <span style={{
                            fontSize: '10px',
                            color: theme.muted,
                            flexShrink: 0,
                          }}>
                            {formatLastMessageTime(otherUser.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <p style={{
                        margin: '4px 0 0',
                        fontSize: '13px',
                        color: theme.muted,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {otherUser.lastMessage || 'Click to start chatting'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{
              padding: '12px',
              borderTop: `1px solid ${theme.border}`,
            }}>
              <button
                type="button"
                onClick={onNavigateToSettings}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '18px',
                  border: 'none',
                  background: theme.subtle,
                  color: theme.text,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: theme.pageBackground,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
        )}

        {showChatPanel && (
          <div className={`dashboard-chat-window ${isCompactMobile ? 'dashboard-chat-window--mobile-page' : ''}`} style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '32px',
            boxShadow: `0 18px 42px ${theme.shadow}`,
            overflow: 'hidden',
          }}>
          {selectedUser ? (
            <>
              <div className="dashboard-chat-header" style={{
                padding: '18px 22px',
                borderBottom: `1px solid ${theme.border}`,
                background: theme.surface,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                {isCompactMobile && (
                  <button
                    type="button"
                    onClick={handleBackToList}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '10px',
                      color: theme.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    title="Back to chats"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                  </button>
                )}
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: theme.pageBackground,
                  color: theme.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}>
                  {getUserInitials(selectedUser.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: theme.text,
                  }}>
                    {selectedUser.name}
                  </h3>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '12px',
                    color: newMessage.trim() ? theme.accent : theme.muted,
                    minHeight: '16px',
                  }}>
                    {newMessage.trim() ? 'Typing...' : '\u00A0'}
                  </p>
                </div>
                <span className="dashboard-chat-status" style={{
                  fontSize: '11px',
                  padding: '5px 10px',
                  background: isConnected ? theme.subtle : theme.pageBackground,
                  color: isConnected ? theme.accent : theme.muted,
                  borderRadius: '999px',
                }}>
                  {isConnected ? 'Connected' : 'Reconnecting...'}
                </span>
              </div>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '22px 24px',
                background: theme.subtle,
              }}>
                {loading ? (
                  <div style={{ textAlign: 'center', color: theme.muted, padding: '40px' }}>
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: theme.muted,
                    padding: '60px 20px',
                  }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={theme.border} strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p style={{ marginTop: '16px', fontSize: '14px' }}>No messages yet</p>
                    <p style={{ fontSize: '12px' }}>Send a message to start chatting!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isOwnMessage = msg.senderEmail === user?.email;
                    const showDate =
                      idx === 0 ||
                      new Date(msg.timestamp).toDateString() !==
                        new Date(messages[idx - 1]?.timestamp).toDateString();

                    return (
                      <div key={msg.id || idx}>
                        {showDate && (
                          <div style={{ textAlign: 'center', margin: '24px 0 16px' }}>
                            <span style={{
                              fontSize: '11px',
                              color: theme.muted,
                              background: theme.surface,
                              padding: '4px 12px',
                              borderRadius: '20px',
                            }}>
                              {new Date(msg.timestamp).toDateString() === new Date().toDateString()
                                ? 'TODAY'
                                : new Date(msg.timestamp)
                                    .toLocaleDateString([], {
                                      month: 'long',
                                      day: 'numeric',
                                      year:
                                        new Date(msg.timestamp).getFullYear() !==
                                        new Date().getFullYear()
                                          ? 'numeric'
                                          : undefined,
                                    })
                                    .toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div style={{
                          display: 'flex',
                          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                          marginBottom: '12px',
                        }}>
                          <div style={{
                            maxWidth: '70%',
                            padding: '12px 16px',
                            borderRadius: isOwnMessage ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                            background: isOwnMessage ? theme.accent : theme.surface,
                            color: isOwnMessage ? theme.accentText : theme.text,
                            boxShadow: `0 10px 24px ${theme.shadow}`,
                            ...(msg.error && { border: '1px solid #f44336' }),
                          }}>
                            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                              {msg.content}
                            </p>
                            <p style={{
                              margin: '5px 0 0',
                              fontSize: '10px',
                              opacity: 0.7,
                              textAlign: 'right',
                            }}>
                              {formatTime(msg.timestamp)}
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

              <form
                className="dashboard-composer"
                onSubmit={sendMessage}
                style={{
                  padding: '16px 20px',
                  background: theme.surface,
                  borderTop: `1px solid ${theme.border}`,
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  style={{
                    flex: 1,
                    padding: '13px 16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '999px',
                    outline: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    background: theme.subtle,
                    color: theme.text,
                  }}
                />
                <button
                  className="dashboard-send-button"
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  style={{
                    background: theme.accent,
                    border: 'none',
                    borderRadius: '999px',
                    padding: '0 20px',
                    cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                    opacity: sending || !newMessage.trim() ? 0.5 : 1,
                    color: theme.accentText,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
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
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme.muted,
              textAlign: 'center',
              padding: '20px',
              background: theme.subtle,
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
          )}
        </div>
        )}
      </div>

      <style>{`
        .dashboard-page {
          overflow: hidden;
        }

        @media (max-width: 900px) {
          .dashboard-page {
            min-height: 100dvh;
          }
          .dashboard-navbar {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) auto;
            grid-template-areas:
              "brand actions"
              "search search";
            align-items: center !important;
            padding: 14px 16px !important;
          }
          .dashboard-brand {
            grid-area: brand;
            min-width: 0;
            flex: initial !important;
          }
          .dashboard-search {
            grid-area: search;
            flex: initial !important;
            max-width: 100% !important;
            width: 100%;
          }
          .dashboard-actions {
            grid-area: actions;
            margin-left: 0;
            justify-self: end;
          }
          .dashboard-layout {
            padding: 14px !important;
          }
          .sidebar {
            position: fixed;
            left: 14px;
            top: 94px;
            bottom: 14px;
            z-index: 1000;
            transform: translateX(-120%);
            transition: transform 0.3s ease;
            max-width: calc(100vw - 28px);
            width: min(320px, calc(100vw - 28px)) !important;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .dashboard-chat-window {
            border-radius: 24px !important;
          }
          .dashboard-chat-header {
            padding: 16px !important;
          }
          .dashboard-composer {
            padding: 14px 16px !important;
          }
        }

        @media (max-width: 640px) {
          .dashboard-page {
            overflow: auto;
          }
          .dashboard-navbar {
            gap: 12px !important;
            padding: 12px 12px 14px !important;
            grid-template-columns: minmax(0, 1fr) auto;
          }
          .dashboard-brand {
            gap: 8px !important;
          }
          .dashboard-brand-badge {
            width: 36px !important;
            height: 36px !important;
            border-radius: 12px !important;
            font-size: 13px !important;
          }
          .dashboard-brand-copy h1 {
            font-size: 18px !important;
            line-height: 1.1;
          }
          .dashboard-brand-copy p {
            display: none;
          }
          .dashboard-search {
            padding: 10px 12px !important;
            gap: 8px !important;
          }
          .dashboard-search-input {
            font-size: 13px !important;
          }
          .dashboard-actions {
            gap: 4px !important;
          }
          .dashboard-profile-button {
            width: 34px !important;
            height: 34px !important;
            font-size: 12px !important;
          }
          .dashboard-logout-button,
          .mobile-menu-btn {
            padding: 6px !important;
          }
          .dashboard-layout {
            padding: 10px !important;
            gap: 12px !important;
          }
          .dashboard-layout--mobile-list,
          .dashboard-layout--mobile-chat {
            padding: 10px !important;
            min-height: calc(100dvh - 94px);
          }
          .sidebar--mobile-page,
          .dashboard-chat-window--mobile-page {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            bottom: auto !important;
            transform: none !important;
            z-index: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 100%;
            border-radius: 20px !important;
          }
          .sidebar--mobile-page {
            box-shadow: none;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .dashboard-chat-window {
            border-radius: 20px !important;
          }
          .dashboard-chat-header {
            flex-wrap: wrap;
            align-items: center !important;
          }
          .dashboard-chat-status {
            width: 100%;
            text-align: left;
          }
          .dashboard-composer {
            flex-direction: column;
            align-items: stretch !important;
          }
          .dashboard-send-button {
            width: 100%;
            justify-content: center;
            padding: 14px 20px !important;
          }
          .dashboard-chat-window input[type="text"] {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
