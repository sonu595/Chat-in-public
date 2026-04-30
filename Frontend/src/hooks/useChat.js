import { useState, useCallback, useRef } from 'react';
import { chatApi, profileApi } from '../lib/api';
import useWebSocket from './useWebSocket';

const useChat = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Yeh ref WebSocket callback ke liye hai — stale closure fix
  const selectedUserRef = useRef(null);

  // Jab bhi selectedUser change ho, ref bhi update karo
  const selectUser = useCallback(async (user) => {
    setSelectedUser(user);
    selectedUserRef.current = user;
    setMessages([]);
    setLoading(true);
    try {
      const conversation = await chatApi.getConversation(user.email);
      const sorted = [...conversation].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      setMessages(sorted);
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
    selectedUserRef.current = null;
    setMessages([]);
    setNewMessage('');
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const list = await profileApi.listUsers();
      setUsers(list);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  // WebSocket se incoming message
  const handleMessageReceived = useCallback((msg) => {
    setMessages((prev) => {
      const exists = prev.some(
        (item) =>
          item.id === msg.id ||
          (item.timestamp === msg.timestamp &&
            item.senderEmail === msg.senderEmail &&
            item.content === msg.content)
      );
      if (exists) return prev;
      return [...prev, msg];
    });
  }, []);

  // User list mein last message update
  const handleUserLastMessageUpdate = useCallback((msg) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === msg.senderEmail
          ? { ...u, lastMessage: msg.content, lastMessageTime: msg.timestamp }
          : u
      )
    );
  }, []);

  const { isConnected, sendViaWebSocket } = useWebSocket({
    selectedUserRef,
    onMessageReceived: handleMessageReceived,
    onUserLastMessageUpdate: handleUserLastMessageUpdate,
  });

  const sendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (!newMessage.trim() || !selectedUser || sending) return;

      const content = newMessage.trim();
      const tempId = `temp-${Date.now()}`;
      setNewMessage('');
      setSending(true);

      // Optimistic message — turant screen pe dikhao
      const tempMsg = {
        id: tempId,
        senderEmail: currentUser.email,
        receiverEmail: selectedUser.email,
        content,
        timestamp: new Date().toISOString(),
        type: 'CHAT',
        isTemp: true,
      };
      setMessages((prev) => [...prev, tempMsg]);

      try {
        const response = await chatApi.sendMessage({
          receiverEmail: selectedUser.email,
          content,
        });

        // Temp message hatao, real message lagao
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        if (response?.data) {
          setMessages((prev) => [...prev, response.data]);
        } else {
          // Fallback: dobara fetch karo
          const conversation = await chatApi.getConversation(selectedUser.email);
          const sorted = [...conversation].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setMessages(sorted);
        }

        // Receiver ko WebSocket se bhi bhejo
        sendViaWebSocket({
          senderEmail: currentUser.email,
          receiverEmail: selectedUser.email,
          content,
          type: 'CHAT',
          timestamp: new Date().toISOString(),
        });

        // User list mein last message update karo
        setUsers((prev) =>
          prev.map((u) =>
            u.email === selectedUser.email
              ? { ...u, lastMessage: content, lastMessageTime: new Date().toISOString() }
              : u
          )
        );
      } catch (err) {
        console.error('Failed to send:', err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, error: true, isTemp: false } : m
          )
        );
      } finally {
        setSending(false);
      }
    },
    [newMessage, selectedUser, sending, currentUser, sendViaWebSocket]
  );

  return {
    users,
    selectedUser,
    messages,
    newMessage,
    setNewMessage,
    loading,
    sending,
    isConnected,
    fetchUsers,
    selectUser,
    clearSelectedUser,
    sendMessage,
  };
};

export default useChat;
