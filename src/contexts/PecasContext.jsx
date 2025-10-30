import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllPecas, getUserPecas } from "@/lib/pecasService";
import { useAuth } from "@/contexts/AuthContext";

const PecasContext = createContext();

export function PecasProvider({ children }) {
  const { user } = useAuth();
  const [pecas, setPecas] = useState([]); // catálogo geral
  const [userPecas, setUserPecas] = useState([]); // inventário do usuário
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [all, mine] = await Promise.all([
          getAllPecas(),
          user ? getUserPecas(user.id) : [],
        ]);
        setPecas(all);
        setUserPecas(mine);
      } catch (e) {
        console.error("Erro ao carregar peças:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <PecasContext.Provider value={{ pecas, userPecas, loading }}>
      {children}
    </PecasContext.Provider>
  );
}

export function usePecas() {
  return useContext(PecasContext);
}
