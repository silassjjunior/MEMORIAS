// src/pages/FeedEventoPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Importa todos os módulos dinamicamente do index
import { moduleComponents } from "@/modules";

const FeedEventoPage = () => {
  const navigate = useNavigate();
  const { chaveId } = useParams();

  const [eventData, setEventData] = useState({ name: "Evento Desconhecido", design_url: null });
  const [modules, setModules] = useState([]);
  const [showHeader, setShowHeader] = useState(true);
  const [eventId, setEventId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Buscar evento e módulos
  useEffect(() => {
    const fetchEvent = async () => {
      if (!chaveId) return;

      try {
        const { data: chaveData, error: chaveError } = await supabase
          .from("chaves")
          .select("event_id, is_admin")
          .eq("id", chaveId)
          .single();

        if (chaveError || !chaveData?.event_id) return;

        const fetchedEventId = chaveData.event_id;
        setEventId(fetchedEventId);
        setIsAdmin(!!chaveData.is_admin);

        const { data: eventResp, error: eventError } = await supabase
          .from("events")
          .select("name, design_url")
          .eq("id", fetchedEventId)
          .single();
        if (eventError) throw eventError;
        if (eventResp) setEventData(eventResp);

        const { data: modulesResp, error: modulesError } = await supabase
          .from("event_modules")
          .select("*")
          .eq("event_id", fetchedEventId)
          .eq("active", true)
          .order("module_order", { ascending: true });
        if (modulesError) throw modulesError;
        setModules(modulesResp || []);
      } catch (err) {
        console.error("Erro ao buscar evento ou módulos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [chaveId]);

  // --- Scroll para esconder header
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 50) setShowHeader(false);
      else setShowHeader(true);
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) return <div className="p-4">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark flex flex-col transition-colors duration-300">
      {/* Header fixo do app */}
      <header
        className={`bg-card dark:bg-card-dark shadow-sm p-3 sticky top-0 z-20 transition-all duration-300 ${
          showHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-foreground dark:text-foreground">
              <ArrowLeft size={24} />
            </button>

            {eventData.design_url ? (
              <img src={eventData.design_url} alt="Evento" className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 bg-gray-400 rounded-full" />
            )}

            <span className="font-bold text-lg">{eventData.name}</span>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate(`/editarfeed/${chaveId}`)}
              className="flex items-center gap-1 bg-primary dark:bg-primary-dark text-white px-3 py-2 rounded-2xl hover:bg-primary-hover dark:hover:bg-primary-hover-dark transition"
            >
              <Edit size={16} /> Editar
            </button>
          )}
        </div>
      </header>

      {/* Conteúdo modular */}
      <main className="flex-1 flex flex-col gap-4 p-3 transition-colors duration-300">
        {modules
          .sort((a, b) => a.module_order - b.module_order)
          .map((module) => {
            const ModuleComponent = moduleComponents[module.module_name];
            return (
              ModuleComponent && (
                <div
                  key={module.id}
                  className=" shadow flex flex-col "
                >
                  {/* Passa eventId e isAdmin para os módulos */}
                  <ModuleComponent eventId={eventId} isAdmin={isAdmin} />
                </div>
              )
            );
          })}
      </main>
    </div>
  );
};

export default FeedEventoPage;
