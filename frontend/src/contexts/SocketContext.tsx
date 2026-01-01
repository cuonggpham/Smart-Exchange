import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (user && !socket) {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
            const SOCKET_URL = API_URL.replace("/api", "");

            const newSocket = io(SOCKET_URL, {
                withCredentials: true,
                transports: ["websocket", "polling"],
            });

            newSocket.on("connect", () => {
                setIsConnected(true);
            });

            newSocket.on("disconnect", () => {
                setIsConnected(false);
            });

            setSocket(newSocket);
        }

        if (!user && socket) {
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
        }

        return () => {};
    }, [user, socket]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};
