import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { session } from '../lib/api';

const useWebSocket = ({ selectedUserRef, onMessageReceived, onUserLastMessageUpdate }) => {
  const stompClientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Callbacks ko bhi ref mein rakho — stale closure se bachao
  const onMessageReceivedRef = useRef(onMessageReceived);
  const onUserLastMessageUpdateRef = useRef(onUserLastMessageUpdate);
  useEffect(() => { onMessageReceivedRef.current = onMessageReceived; }, [onMessageReceived]);
  useEffect(() => { onUserLastMessageUpdateRef.current = onUserLastMessageUpdate; }, [onUserLastMessageUpdate]);

  const connect = useCallback(() => {
    const token = session.getToken();

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        setIsConnected(true);
        console.log('WebSocket connected ✓');

        client.subscribe('/user/queue/messages', (frame) => {
          try {
            const msg = JSON.parse(frame.body);
            console.log('Message received via WS:', msg);

            // Har incoming message ke liye user list update karo
            onUserLastMessageUpdateRef.current(msg);

            // Sirf tab chat mein dikhao jab selected user wahi ho jisne bheja
            if (
              selectedUserRef.current &&
              msg.senderEmail === selectedUserRef.current.email
            ) {
              onMessageReceivedRef.current(msg);
            }
          } catch (err) {
            console.error('Failed to parse WS message:', err);
          }
        });
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setIsConnected(false);
      },
      onWebSocketError: (err) => {
        console.error('WS error:', err);
        setIsConnected(false);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;
  }, []); // sirf mount pe — refs ke through latest values milti hain

  const sendViaWebSocket = useCallback((payload) => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.private',
        body: JSON.stringify(payload),
      });
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      stompClientRef.current?.deactivate();
    };
  }, [connect]);

  return { isConnected, sendViaWebSocket };
};

export default useWebSocket;
