import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
window.supabase = supabase;


// Pega iniciais (ex: João da Silva → JS)
const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const last = parts[parts.length - 1]?.[0] || "";
  return (first + last).toUpperCase();
};

const SuggestedProfiles = ({ eventId, currentUserId }) => {
  const [profiles, setProfiles] = useState([]);
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!eventId) return;

    const fetchProfiles = async () => {
      setLoading(true);

      // 1️⃣ Buscar chaves + usuário + memórias públicas (somente quem postou)
      const { data, error } = await supabase
        .from("chaves")
        .select(`
          id,
          owner_id,
          Users ( id, username, avatar_url ),
          memories:memories (
            id,
            privacy,
            created_at
          )
        `)
        .eq("event_id", eventId)
        .not("owner_id", "is", null);

      if (error) {
        console.error("Erro ao buscar perfis:", error);
        setLoading(false);
        return;
      }

      // 2️⃣ Filtrar quem tem pelo menos 1 memória pública
      const withPublicMemories = data
        .map((row) => ({
          ...row,
          publicCount: row.memories?.filter((m) => m.privacy === "public").length || 0,
          lastPublicMemory: row.memories
            ?.filter((m) => m.privacy === "public")
            ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        }))
        .filter((row) => row.publicCount > 0);

      // 3️⃣ Ordenar por última memória pública (do mais recente ao mais antigo)
      const sorted = withPublicMemories.sort((a, b) => {
        if (!a.lastPublicMemory || !b.lastPublicMemory) return 0;
        return new Date(b.lastPublicMemory.created_at) - new Date(a.lastPublicMemory.created_at);
      });

      // 4️⃣ Remover usuário atual
      const filtered = sorted.filter((p) => p.owner_id !== currentUserId);

      setProfiles(filtered);
      setLoading(false);
    };

    const fetchViews = async () => {
      const { data } = await supabase
        .from("profile_views")
        .select("target_chave_id")
        .eq("viewer_id", currentUserId)
        .eq("event_id", eventId);

      setViews(data?.map((v) => v.target_chave_id) || []);
    };

    fetchProfiles();
    fetchViews();
  }, [eventId, currentUserId]);

  const handleClick = async (chaveId) => {
    await supabase.from("profile_views").insert({
      viewer_id: currentUserId,
      target_chave_id: chaveId,
      event_id: eventId
    });

    // Reorganizar localmente sem refazer queries
    const newViews = [...views, chaveId];
    setViews(newViews);

    // Mover este item para o final da fila
    setProfiles((prev) => {
      const target = prev.find((p) => p.id === chaveId);
      const rest = prev.filter((p) => p.id !== chaveId);
      return [...rest, target];
    });

    navigate(`/suasmemorias/${chaveId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
        Carregando perfis...
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
        Ainda não há memórias públicas neste evento.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-3">
      <div className="flex gap-4 px-3">

        {profiles.map(({ id: chaveId, Users: user }) => {
          const hasViewed = views.includes(chaveId);
          const initials = getInitials(user?.username);

          return (
            <motion.div
              key={chaveId}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleClick(chaveId)}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 250, damping: 18 }}
            >
              <div
                className={`
                  relative w-16 h-16 rounded-full p-[3px]
                  ${hasViewed ? "" : "glow-ring bg-gradient-to-tr from-pink-500 to-yellow-400"}
                `}
                style={{ borderRadius: "999px" }}
              >
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center">
                      <svg width="48" height="48">
                        <circle cx="24" cy="24" r="24" fill="#d1d5db" />
                        <text
                          x="50%"
                          y="55%"
                          textAnchor="middle"
                          fontSize="16"
                          fontWeight="bold"
                          fill="#555"
                        >
                          {initials}
                        </text>
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <span className="mt-1 text-xs text-center text-gray-700 dark:text-gray-300 w-16 truncate">
                {user.username}
              </span>

            </motion.div>
          );
        })}

      </div>
    </div>
  );
};

export default SuggestedProfiles;
