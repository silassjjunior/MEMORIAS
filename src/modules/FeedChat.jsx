// src/modules/FeedChat.jsx
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, X } from "lucide-react";

const colors = [
  "bg-blue-500 text-white",
  "bg-green-500 text-white",
  "bg-purple-500 text-white",
  "bg-yellow-400 text-black",
  "bg-pink-500 text-white",
  "bg-indigo-500 text-white",
];

const FeedChat = ({ eventId, preview }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef(null);

  const getUserColor = (userId) => {
    const index = userId ? userId.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // Buscar mensagens iniciais
  useEffect(() => {
    if (!eventId) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("event_chat")
          .select("*")
          .eq("event_id", eventId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [eventId]);

  // Contar mensagens não lidas
  useEffect(() => {
    if (!user) return;
    const count = messages.filter((msg) => !msg.read_by?.includes(user.id)).length;
    setUnreadCount(count);
  }, [messages, user]);

  // Escutar novas mensagens em tempo real
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`public:event_chat:eventId=eq.${eventId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "event_chat" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [eventId]);

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { data, error } = await supabase.from("event_chat").insert([
        {
          event_id: eventId,
          user_id: user.id,
          user_name: user.username || user.email,
          message: newMessage.trim(),
          read_by: [user.id],
        },
      ]);
      if (error) throw error;

      if (data && data.length > 0) {
        setMessages((prev) => [...prev, data[0]]);
      }
      setNewMessage("");
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  // Marcar mensagens como lidas ao abrir modal
  const markMessagesAsRead = async () => {
    if (!user) return;
    const unreadMessages = messages.filter((msg) => !msg.read_by?.includes(user.id));

    for (const msg of unreadMessages) {
      const updatedReadBy = [...(msg.read_by || []), user.id];
      try {
        await supabase.from("event_chat").update({ read_by: updatedReadBy }).eq("id", msg.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, read_by: updatedReadBy } : m))
        );
      } catch (err) {
        console.error("Erro ao marcar como lida:", err);
      }
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    markMessagesAsRead();
  };

  // Scroll automático
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isModalOpen]);

  if (preview) {
    return (
      <div className="flex items-center justify-center w-full h-24 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
        Chat do Evento
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-2 bg-primary dark:bg-primary-dark text-white px-4 py-2 rounded hover:bg-primary-hover dark:hover:bg-primary-hover-dark transition"
      >
        <MessageCircle size={16} />
        Abrir Chat {unreadCount > 0 && `(${unreadCount})`}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md h-[80vh] rounded-lg shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="font-bold text-lg">Chat do Evento</span>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {messages.map((msg) => {
                const isCurrentUser = msg.user_id === user.id;
                const bubbleColor = getUserColor(msg.user_id);
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      isCurrentUser ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <span className="text-xs text-gray-400 mb-1">{msg.user_name}</span>
                    <div
                      className={`px-3 py-2 rounded-xl break-words ${bubbleColor} ${
                        isCurrentUser ? "rounded-br-none" : "rounded-bl-none"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex p-4 gap-2 border-t border-gray-200 dark:border-gray-700">
              <input
                type="text"
                className="flex-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Digite sua mensagem..."
              />
              <button
                onClick={handleSendMessage}
                className="bg-primary dark:bg-primary-dark text-white px-4 py-2 rounded hover:bg-primary-hover dark:hover:bg-primary-hover-dark transition"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedChat;
