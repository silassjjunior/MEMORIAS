import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useChave } from "@/contexts/ChaveContext";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// ✅ Cartão visual com até 3 imagens de fundo (sem vídeos)
const MemoryCard = ({ title, type, eventId, chaveId, onClick, coverImageUrl }) => {
  const [medias, setMedias] = useState([]);
  const [init, setInit] = useState(false);

  useEffect(() => {
    // Inicializa partículas (somente uma vez)
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  useEffect(() => {
    const fetchMedias = async () => {
      if (!eventId && !chaveId) return;
      let query = supabase.from("memories").select("file_url, type");

      if (type === "feed") {
        query = query
          .eq("event_id", eventId)
          .eq("featured", true)
          .order("created_at", { ascending: false })
          .limit(10);
      } else if (type === "memories") {
        query = query
          .eq("chave_id", chaveId)
          .order("created_at", { ascending: false })
          .limit(10);
      } else if (type === "timeline") {
        query = query
          .eq("event_id", eventId)
          .eq("shared_to_event", true)
          .order("compartilhado_em", { ascending: false })
          .limit(10);
      }

      const { data, error } = await query;
      if (error || !data) return;

      // 🔍 Filtro: apenas imagens (extensões conhecidas)
      const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
      const onlyImages = data.filter((m) => {
        const ext = (m.type || "").toLowerCase().trim();
        return imageExtensions.includes(ext);
      });

      // 🔹 Mantém no máximo 3 imagens
      setMedias(onlyImages.slice(0, 3));
    };

    if (!coverImageUrl) fetchMedias();
  }, [eventId, chaveId, type, coverImageUrl]);

  // ✨ Configuração de partículas suaves
  const particlesOptions = {
    background: { color: { value: "transparent" } },
    fullScreen: { enable: false },
    fpsLimit: 60,
    particles: {
      number: { value: 77 },
      color: { value: "#f7f7f7ff" },
      links: {
        enable: true,
        color: "#60a5fa",
        distance: 50,
        opacity: 0.7,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.7,
        random: true,
        outModes: "out",
      },
      opacity: { value: 1.0 },
      shape: { type: "square" },
      size: { value: { min: 0.7, max: 7 } },
    },
    detectRetina: true,
  };

  const emptySubtitle = "Nenhuma memória adicionada ainda.";

  return (
    <div
      onClick={onClick}
      className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
    >
      {/* Fundo com prioridade: coverImageUrl > mídias de memória > partículas */}
      <div className="absolute inset-0 flex">
        {coverImageUrl ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${coverImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ) : medias.length > 0 ? (
          medias.map((media, i) => (
            <div
              key={i}
              className="flex-1 relative h-full"
              style={{
                backgroundImage: `url(${media.file_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ))
        ) : (
          <div className="absolute inset-0 bg-card">
            {init && (
              <Particles
                id={`tsparticles-${title}`}
                options={particlesOptions}
                className="absolute inset-0"
              />
            )}
          </div>
        )}
      </div>

      {/* Overlay de texto */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center z-10">
        <h2 className="text-foreground text-xl sm:text-2xl font-bold drop-shadow-md">
          {title}
        </h2>
        {!coverImageUrl && medias.length === 0 && (
          <p className="text-sm sm:text-base text-muted-foreground mt-1 opacity-80">
            {emptySubtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const MemoriasPage = () => {
  const { user } = useAuth();
  const { chaveSelecionada } = useChave();
  const [events, setEvents] = useState([]);
  const [mainEvent, setMainEvent] = useState(null);
  const [mainChaveId, setMainChaveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      setLoading(true);

      try {
        let mainChave = null;

        if (chaveSelecionada) {
          const { data, error } = await supabase
            .from("chaves")
            .select("id, event_id, serial_number")
            .eq("id", chaveSelecionada)
            .eq("owner_id", user.id)
            .single();
          if (error) throw error;
          mainChave = data;
        } else {
          const { data: chaves, error } = await supabase
            .from("chaves")
            .select("id, event_id, serial_number")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);
          if (error) throw error;
          if (!chaves || chaves.length === 0) return;
          mainChave = chaves[0];
        }

        if (!mainChave) return;
        setMainChaveId(mainChave.id);

        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("id, name, design_url, cover_image_url")
          .eq("id", mainChave.event_id)
          .single();
        if (eventError) throw eventError;

        setMainEvent({
          id: eventData.id,
          name: eventData.name,
          keyNumber: mainChave.serial_number
            ? `#${mainChave.serial_number}`
            : `#${String(mainChave.id).padStart(5, "0")}`,
          imageUrl: eventData.design_url || "/img/chave-placeholder.png",
          coverImageUrl: eventData.cover_image_url,
          chaveId: mainChave.id,
        });

        const { data: chavesUser, error: chavesUserError } = await supabase
          .from("chaves")
          .select("id, event_id, serial_number")
          .eq("owner_id", user.id);
        if (chavesUserError) throw chavesUserError;

        const eventIds = chavesUser.map((c) => c.event_id);
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("id, design_url, cover_image_url")
          .in("id", eventIds);
        if (eventsError) throw eventsError;

        setEvents(eventsData || []);
      } catch (err) {
        console.error("Erro ao buscar eventos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, chaveSelecionada]);

  const handleAddImages = () => {
    if (!mainChaveId) {
      alert("Chave principal não encontrada!");
      return;
    }
    navigate(`/addimagens/${mainChaveId}`);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background flex flex-col pb-20">
      <header className="bg-card dark:bg-card p-2 shadow-sm flex items-center space-x-4">
        <div className="flex-shrink-0">
          <img
            src={mainEvent?.imageUrl || "/img/chave-placeholder.png"}
            alt="Chave do Evento"
            className="w-15 h-15 ml-4 object-cover rounded-md"
          />
        </div>
        <div className="flex-grow flex flex-col items-center justify-center">
          <h1 className="text-foreground text-lg font-bold">
            {mainEvent?.name || "Carregando..."}
          </h1>
          <p className="text-muted-foreground text-sm font-semibold">
            {mainEvent?.keyNumber || "#00000"}
          </p>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : (
          <>
            <MemoryCard
              title="FEED DO EVENTO"
              type="feed"
              eventId={mainEvent?.id}
              coverImageUrl={mainEvent?.coverImageUrl}
              onClick={() => navigate(`/feedevento/${mainChaveId}`)}
            />

            <MemoryCard
              title="MINHAS MEMÓRIAS"
              type="memories"
              chaveId={mainChaveId}
              onClick={() => navigate(`/minhasmemorias/${mainChaveId}`)}
            />

            <MemoryCard
              title="TIMELINE INTERATIVA"
              type="timeline"
              eventId={mainEvent?.id}
              onClick={() => navigate(`/feedgeral/${mainChaveId}`)}
            />
          </>
        )}
      </main>

      <div className="px-4 py-2">
        <button
          onClick={handleAddImages}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-primary-hover transition-colors"
        >
          <Plus size={24} />
          <span>ADICIONE IMAGENS</span>
        </button>
      </div>
    </div>
  );
};

export default MemoriasPage;
