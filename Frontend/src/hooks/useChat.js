import { useState, useCallback, useRef } from 'react';
import { chatApi, profileApi } from '../lib/api';
import useWebSocket from './useWebSocket';

const sortMessages = (items) =>
  [...items].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

const useChat = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const selectedUserRef = useRef(null);

  const selectUser = useCallback(async (user) => {
    setSelectedUser(user);
    selectedUserRef.current = user;
    setMessages([]);
    setLoading(true);

    try {
      const conversation = await chatApi.getConversation(user.email);
      setMessages(sortMessages(conversation));
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

  const handleMessageReceived = useCallback((msg) => {
    setMessages((prev) => {
      const exists = prev.some(
        (item) =>
          item.id === msg.id ||
          (item.timestamp === msg.timestamp &&
            item.senderEmail === msg.senderEmail &&
            item.receiverEmail === msg.receiverEmail &&
            item.content === msg.content)
      );

      if (exists) {
        return prev;
      }

      return sortMessages([...prev, msg]);
    });
  }, []);

  const handleUserLastMessageUpdate = useCallback((msg) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === msg.senderEmail
          ? { ...u, lastMessage: msg.content, lastMessageTime: msg.timestamp }
          : u
      )
    );
  }, []);

  const { isConnected } = useWebSocket({
    currentUserEmail: currentUser?.email,
    selectedUserRef,
    onMessageReceived: handleMessageReceived,
    onUserLastMessageUpdate: handleUserLastMessageUpdate,
  });

  const sendMessage = useCallback(
    async (e) => {
      e.preventDefault();

      if (!newMessage.trim() || !selectedUser || sending) {
        return;
      }

      const content = newMessage.trim();
      const tempId = `temp-${Date.now()}`;
      const optimisticTimestamp = new Date().toISOString();

      setNewMessage('');
      setSending(true);
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          senderEmail: currentUser.email,
          receiverEmail: selectedUser.email,
          content,
          timestamp: optimisticTimestamp,
          type: 'CHAT',
          isTemp: true,
        },
      ]);

      try {
        const savedMessage = await chatApi.sendMessage({
          receiverEmail: selectedUser.email,
          content,
        });

        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempId);

          if (!savedMessage) {
            return withoutTemp;
          }

          const exists = withoutTemp.some((m) => m.id === savedMessage.id);
          if (exists) {
            return withoutTemp;
          }

          return sortMessages([...withoutTemp, savedMessage]);
        });

        setUsers((prev) =>
          prev.map((u) =>
            u.email === selectedUser.email
              ? {
                  ...u,
                  lastMessage: content,
                  lastMessageTime: savedMessage?.timestamp ?? optimisticTimestamp,
                }
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
    [newMessage, selectedUser, sending, currentUser]
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
