import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAppContext } from "./AppContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useAppContext();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(import.meta.env.VITE_BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
