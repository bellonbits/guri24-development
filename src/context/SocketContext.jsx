import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!user || !token) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        const getSocketUrl = () => {
            if (import.meta.env.VITE_API_URL) {
                return import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '');
            }

            const host = window.location.hostname;

            // 1. Local Development
            if (host === 'localhost' || host === '127.0.0.1') {
                return 'http://localhost:8000';
            }

            // 2. Production Guri24 (API is on api subdomain)
            if (host.includes('guri24.com')) {
                return 'https://api.guri24.com:8002';
            }

            // 3. Fallback for IP-based or other access
            const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
            return `${protocol}//${host}:8002`;
        };

        const socketUrl = getSocketUrl();
        console.log(`[Socket] Connecting to ${socketUrl}...`);

        const newSocket = io(socketUrl, {
            auth: { token },
            transports: ['polling', 'websocket'], // Try polling first for better compatibility
            reconnectionAttempts: 20,
            reconnectionDelay: 2000,
            timeout: 20000,
            forceNew: true
        });

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            setConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user, token]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};
