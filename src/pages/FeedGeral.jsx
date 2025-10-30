import React, { useState, useEffect } from "react";
import Feed from "@/components/Feed";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Share } from "lucide-react";
import { supabase } from "@/lib/supabase";

const FeedGeralPage = () => {
  const navigate = useNavigate();
  const { chaveId: paramChaveId } = useParams();
  const [eventData, setEventData] = useState({ name: "Evento Desconhecido", design_url: null });
  const [showHeader, setShowHeader] = useState(true); // controla visibilidade do header

  // --- Fetch evento
  useEffect(() => {
    const fetchEvent = async () => {
      if (!paramChaveId) return;

      try {
        const { data: chaveData, error: chaveError } = await supabase
          .from("chaves")
          .select("event_id")
          .eq("id", paramChaveId)
          .single();

        if (chaveError || !chaveData?.event_id) return;

        const eventId = chaveData.event_id;

        const { data: eventResp } = await supabase
          .from("events")
          .select("name, design_url")
          .eq("id", eventId)
          .single();

        if (eventResp) setEventData(eventResp);
      } catch (err) {
        console.error("Erro ao buscar evento:", err);
      }
    };

    fetchEvent();
  }, [paramChaveId]);

  // --- Scroll para esconder header
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        // rolando para baixo -> esconde
        setShowHeader(false);
      } else {
        // rolando para cima -> mostra
        setShowHeader(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <header
        className={`bg-card dark:bg-card-dark shadow-sm p-3 sticky top-0 z-20 transition-all duration-300 ${
          showHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        {/* Linha 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <button onClick={() => navigate(-1)} className="text-foreground dark:text-foreground">
              <ArrowLeft size={24} />
            </button>

            {eventData.design_url ? (
              <img src={eventData.design_url} alt="Evento" className="w-18 h-18" />
            ) : (
              <div className="w-12 h-12 bg-gray-400 rounded-full" />
            )}

            <div className="font-bold text-lg">FEED</div>
          </div>

          <button
            onClick={() => navigate(`/compartilharpage/${paramChaveId}`)}
            className="flex items-center space-x-1 bg-primary dark:bg-primary-dark text-white px-3 py-2 rounded-2xl hover:bg-primary-hover dark:hover:bg-primary-hover-dark transition"
          >
            <Share size={16} />
            <span>Compartilhar</span>
          </button>
        </div>

        {/* Linha 2 */}
        <div className="flex justify-center">
          <div className="text-lg font-semibold">{eventData.name}</div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 transition-colors duration-300">
        <Feed tipo="geral" chaveId={paramChaveId} />
      </main>
    </div>
  );
};

export default FeedGeralPage;
