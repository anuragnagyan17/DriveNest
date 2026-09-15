import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppContext } from "../Context/AppContext";
import { useSocket } from "../Context/SocketContext";
import toast from "react-hot-toast";

const ChatWindow = ({ bookingId, isOpen, onClose, otherPartyName }) => {
  const { axios, user } = useAppContext();
  const { socket } = useSocket();
  const currentUserId = user?._id;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !bookingId) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/chat/${bookingId}`);
        if (data.success) {
          setMessages(data.messages);
        } else {
          toast.error("Could not load messages");
        }
      } catch (error) {
        toast.error("Could not load messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [bookingId, isOpen, axios]);

  useEffect(() => {
    if (!socket || !isOpen || !bookingId) return;

    socket.emit("chat:join", bookingId);

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat:message", handleNewMessage);

    return () => {
      socket.emit("chat:leave", bookingId);
      socket.off("chat:message", handleNewMessage);
    };
  }, [socket, bookingId, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const { data } = await axios.post("/api/chat/send", {
        bookingId,
        text: newMessage.trim(),
      });
      if (data.success) {
        setNewMessage("");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />
      <div className="fixed bottom-6 md:bottom-6 left-6 z-50 w-[calc(100vw-3rem)] md:w-full max-w-[420px] max-h-[80vh] flex flex-col bg-[#0a0a0a] border border-borderColor rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-borderColor bg-black/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="font-semibold text-lg text-white">
              {otherPartyName}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <>
              <div className="animate-pulse flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-slate-700" />
                <div className="h-10 w-48 rounded-xl bg-slate-700" />
              </div>
              <div className="animate-pulse flex gap-2 justify-end">
                <div className="h-10 w-48 rounded-xl bg-slate-700" />
                <div className="w-7 h-7 rounded-full bg-slate-700" />
              </div>
              <div className="animate-pulse flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-slate-700" />
                <div className="h-10 w-48 rounded-xl bg-slate-700" />
              </div>
            </>
          ) : messages.length === 0 ? (
            <div className="text-slate-500 text-sm text-center mt-8">
              <p>👋 No messages yet. Say hello!</p>
              <p className="text-xs text-slate-600 mt-1">
                Previous conversations with this person appear here
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600 text-center mb-3">
                Conversation history with this person
              </p>
              {messages.map((message, idx) => {
                const isOwn =
                  message.sender._id === currentUserId ||
                  message.sender._id?.toString() === currentUserId?.toString();

                return (
                  <div
                    key={message._id || idx}
                    className={`flex ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwn && (
                      <div className="mr-2 self-end mb-1">
                        {message.sender.image ? (
                          <img
                            src={message.sender.image}
                            alt="avatar"
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white">
                            {message.sender.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 max-w-[75%] text-sm ${
                        isOwn
                          ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                          : "bg-slate-800 text-slate-100 rounded-2xl rounded-bl-sm"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="text-[10px] mt-1 opacity-60 text-right">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-borderColor bg-black/20 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 w-full bg-transparent border border-borderColor rounded-lg p-3 text-sm text-slate-300 outline-none focus:border-primary disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="bg-primary hover:bg-primary-dull disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default ChatWindow;
