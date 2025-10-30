import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

const SuggestedProfiles = ({ eventId, currentUserId }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!eventId) return;

    const fetchProfiles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("chaves")
        .select("id, owner_id, Users(username, avatar_url, id)")
        .eq("event_id", eventId)
        .not("owner_id", "is", null);

      if (error) {
        console.error("Erro ao buscar perfis do evento:", error);
        setLoading(false);
        return;
      }

      // 🔹 Filtra usuários únicos (um por chave)
      const seen = new Set();
      const uniqueProfiles = data
        .filter((row) => {
          if (seen.has(row.owner_id)) return false;
          seen.add(row.owner_id);
          return true;
        })
        // 🔹 Remove o próprio usuário
        .filter((row) => row.owner_id !== currentUserId);

      setProfiles(uniqueProfiles);
      setLoading(false);
    };

    fetchProfiles();
  }, [eventId, currentUserId]);

  const handleClick = (chaveId) => {
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
        Nenhum outro usuário neste evento ainda.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-3">
      <div className="flex gap-4 px-3">
        {profiles.map(({ id: chaveId, Users: user }) => (
          <motion.div
            key={chaveId}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleClick(chaveId)}
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-yellow-400">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs">
                    ?
                  </div>
                )}
              </div>
            </div>
            <span className="mt-1 text-xs text-center text-gray-700 dark:text-gray-300 w-16 truncate">
              {user?.username || "Usuário"}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedProfiles;
