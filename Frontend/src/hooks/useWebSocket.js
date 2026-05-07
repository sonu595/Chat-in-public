import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { session, SOCKET_ENDPOINT_URL } from '../lib/api';

const buildInboxDestination = (email) => `/topic/messages/${email}`;

const useWebSocket = ({
  currentUserEmail,
  selectedUserRef,
  onMessageReceived,
  onUserLastMessageUpdate,
}) => {
  const stompClientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const onMessageReceivedRef = useRef(onMessageReceived);
  const onUserLastMessageUpdateRef = useRef(onUserLastMessageUpdate);

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    onUserLastMessageUpdateRef.current = onUserLastMessageUpdate;
  }, [onUserLastMessageUpdate]);

  const connect = useCallback(() => {
    const token = session.getToken();
    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_ENDPOINT_URL),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        console.log('WebSocket connected');

        client.subscribe(buildInboxDestination(currentUserEmail), (frame) => {
          try {
            const msg = JSON.parse(frame.body);
            onUserLastMessageUpdateRef.current(msg);

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
  }, [currentUserEmail, selectedUserRef]);

  useEffect(() => {
    if (!currentUserEmail) {
      return undefined;
    }

    connect();

    return () => {
      stompClientRef.current?.deactivate();
      stompClientRef.current = null;
      setIsConnected(false);
    };
  }, [connect, currentUserEmail]);

  return { isConnected };
};

export default useWebSocket;
