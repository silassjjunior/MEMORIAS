import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useChave } from "@/contexts/ChaveContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  StarOff,
  LayoutList,
  LayoutGrid,
  LayoutDashboard,
} from "lucide-react";
import { motion } from "framer-motion";

const CuradoriaPage = () => {
  const { chaveSelecionada } = useChave();
  const [memories, setMemories] = useState([]);
  const [eventData, setEventData] = useState({
    name: "Evento Desconhecido",
    design_url: null,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | featured | not_featured
  const [viewMode, setViewMode] = useState("full");
  const navigate = useNavigate();

  useEffect(() => {
    if (!chaveSelecionada) return;
    fetchMemoriesAndEvent();
  }, [chaveSelecionada]);

  const fetchMemoriesAndEvent = async () => {
    try {
      setLoading(true);

      // 🔹 Busca a chave e o event_id
      const { data: chaveData, error: chaveError } = await supabase
        .from("chaves")
        .select("event_id")
        .eq("id", chaveSelecionada)
        .single();

      if (chaveError || !chaveData?.event_id) {
        console.warn("Chave sem event_id vinculado");
        setLoading(false);
        return;
      }

      // 🔹 Busca o evento
      const { data: eventInfo } = await supabase
        .from("events")
        .select("id, name, design_url")
        .eq("id", chaveData.event_id)
        .single();

      if (eventInfo) setEventData(eventInfo);

      // 🔹 Busca memórias públicas do evento
      const { data: memoriesData, error: memoriesError } = await supabase
        .from("memories")
        .select(`
          id, file_url, legenda, featured, created_at,
          uploader:uploader_id(id, username, avatar_url)
        `)
        .eq("event_id", chaveData.event_id)
        .eq("privacy", "public")
        .order("created_at", { ascending: false });

      if (memoriesError) throw memoriesError;
      setMemories(memoriesData || []);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Alternar destaque
  const toggleFeatured = async (memory) => {
    try {
      await supabase
        .from("memories")
        .update({ featured: !memory.featured })
        .eq("id", memory.id);

      setMemories((prev) =>
        prev.map((m) =>
          m.id === memory.id ? { ...m, featured: !m.featured } : m
        )
      );
    } catch (err) {
      console.error("Erro ao atualizar destaque:", err);
    }
  };

  // 🔹 Filtro de memórias
  const filteredMemories =
    filter === "all"
      ? memories
      : filter === "featured"
      ? memories.filter((m) => m.featured)
      : memories.filter((m) => !m.featured);

  // 🔹 Classes de visualização
  const getGridClasses = () => {
    switch (viewMode) {
      case "medium":
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3";
      case "small":
        return "grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2";
      default:
        return "flex flex-col space-y-6";
    }
  };

  const renderViewModeIcon = (mode) => {
    switch (mode) {
      case "medium":
        return <LayoutGrid size={18} />;
      case "small":
        return <LayoutDashboard size={18} />;
      default:
        return <LayoutList size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark transition-colors duration-300 flex flex-col">
      {/* HEADER */}
      <header className="bg-card dark:bg-card-dark shadow-sm p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="text-foreground">
              <ArrowLeft size={22} />
            </button>

            {eventData.design_url ? (
              <img
                src={eventData.design_url}
                alt="Capa do Evento"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-400" />
            )}

            <h1 className="font-semibold text-lg">Curadoria</h1>
          </div>
          <span className="text-sm text-muted-foreground">{eventData.name}</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Filtro */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter("featured")}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === "featured"
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              Favoritas
            </button>
            <button
              onClick={() => setFilter("not_featured")}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === "not_featured"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              Não favoritas
            </button>
          </div>

          {/* Visualização */}
          <div className="flex gap-2">
            {["full", "medium", "small"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-full ${
                  viewMode === mode
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {renderViewModeIcon(mode)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 p-4">
        {loading ? (
          <p className="text-center animate-pulse">Carregando memórias...</p>
        ) : filteredMemories.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhuma memória encontrada.
          </p>
        ) : (
          <motion.div
            className={getGridClasses()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredMemories.map((memory) => (
              <div
                key={memory.id}
                className={`relative rounded-2xl overflow-hidden group shadow-md ${
                  memory.featured ? "ring-4 ring-yellow-400" : ""
                }`}
              >
                <img
                  src={memory.file_url}
                  alt={memory.legenda || "Imagem"}
                  className={`object-cover w-full ${
                    viewMode === "full"
                      ? "h-80"
                      : viewMode === "medium"
                      ? "h-48"
                      : "h-32"
                  }`}
                />

                {/* Overlay do uploader e botão de destaque */}
                <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                  {/* Parte de cima: Favoritar */}
                  <button
                    onClick={() => toggleFeatured(memory)}
                    className="self-end bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
                    title={
                      memory.featured
                        ? "Remover dos destaques"
                        : "Marcar como destaque"
                    }
                  >
                    {memory.featured ? (
                      <Star className="text-yellow-400" size={18} />
                    ) : (
                      <StarOff size={18} />
                    )}
                  </button>

                  {/* Parte de baixo: Info */}
                  {viewMode === "full" && (
                    <div className="flex items-center justify-between text-white text-xs bg-black/40 p-2 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        {memory.uploader?.avatar_url ? (
                          <img
                            src={memory.uploader.avatar_url}
                            alt="avatar"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-500" />
                        )}
                        <span>{memory.uploader?.username || "Anônimo"}</span>
                      </div>
                      <span className="text-[10px] opacity-80">
                        {new Date(memory.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CuradoriaPage;
