// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useChave } from "@/contexts/ChaveContext";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// 🔹 CARD DE EVENTO (com suporte a banner e partículas)
const EventCard = ({ event, onClick }) => {
  const [init, setInit] = useState(false);
  const images = event.images || [];
  const hasBanner =
    typeof event.cover_image_url === "string" &&
    event.cover_image_url.trim() !== "";

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

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
        direction: "none",
        random: true,
        straight: false,
        outModes: "out",
      },
      opacity: { value: 1.0 },
      shape: { type: "square" },
      size: { value: { min: 0.7, max: 7 } },
    },
    detectRetina: true,
  };

  return (
    <button
      onClick={onClick}
      className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-200 group"
    >
      {/* 🖼️ Fundo (Banner, imagens ou partículas) */}
      {hasBanner ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:brightness-110 group-hover:saturate-110"
          style={{ backgroundImage: `url(${event.cover_image_url})` }}
        />
      ) : images.length > 0 ? (
        <div className="absolute inset-0 flex transition-all duration-300 group-hover:brightness-110 group-hover:saturate-110">
          {images.map((img, i) => (
            <div
              key={i}
              className="flex-1 h-full"
              style={{
                backgroundImage: `url(${img.file_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 bg-card">
          {init && (
            <Particles
              id={`tsparticles-${event.id}`}
              options={particlesOptions}
              className="absolute inset-0"
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
            <h2 className="text-foreground text-lg sm:text-xl font-semibold drop-shadow-md">
              {event.name}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Nenhuma memória adicionada ainda ✨
            </p>
          </div>
        </div>
      )}

      {/* 🔲 Overlay escuro */}
      <div className="absolute inset-0 bg-black/30" />

      {/* 🧠 Nome do evento */}
      <div className="absolute left-0 top-0 h-full w-3/5 flex items-center justify-center px-3">
        <div className="text-center">
          <h2
            className="text-white text-lg sm:text-xl font-bold break-words"
            style={{
              textShadow:
                "2px 2px 6px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.3)",
            }}
          >
            {event.name}
          </h2>
        </div>
      </div>

      {/* 🪄 Logo da chave */}
      {event.chave_id && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-28 sm:w-32 h-28 sm:h-32 rounded-lg overflow-hidden z-10">
          <img
            src={event.design_url || "/img/memoria-placeholder.jpg"}
            alt="Chave"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </button>
  );
};

// 🔹 DASHBOARD PRINCIPAL
const DashboardPage = () => {
  const { user } = useAuth();
  const { setChaveSelecionada } = useChave();
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;

      try {
        // 🔸 Buscar chaves do usuário
        const { data: chaves, error: chaveError } = await supabase
          .from("chaves")
          .select("id, event_id, serial_number")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: true });

        if (chaveError) throw chaveError;
        if (!chaves?.length) return;

        // 🔸 Buscar eventos com banner e design
        const eventIds = chaves.map((c) => c.event_id);
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("id, name, design_url, cover_image_url")
          .in("id", eventIds);

        if (eventsError) throw eventsError;

        // 🔸 Buscar memórias
        const { data: memoriesData, error: memoriesError } = await supabase
          .from("memories")
          .select("file_url, event_id, chave_id")
          .in("chave_id", chaves.map((c) => c.id))
          .order("created_at", { ascending: false });

        if (memoriesError) throw memoriesError;

        // 🔸 Montar estrutura final
        const eventsWithData = eventsData.map((event) => {
          const chave = chaves.find((c) => c.event_id === event.id);
          const images = memoriesData
            .filter(
              (img) =>
                img.event_id === event.id && img.chave_id === chave?.id
            )
            .slice(0, 3);

          return {
            ...event,
            chave_id: chave?.id,
            serial_number: chave?.serial_number,
            images,
          };
        });

        setEvents(eventsWithData);
      } catch (err) {
        console.error("Erro ao buscar eventos e imagens:", err);
      }
    };

    fetchAllData();
  }, [user]);

  const handleNavigate = (chaveId) => {
    setChaveSelecionada(chaveId);
    navigate("/memories");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 🧭 Header */}
      <header className="bg-card fixed top-0 left-0 right-0 z-20 shadow-md p-1 flex justify-center">
        <h1 className="text-xl font-bold text-primary">MEMÓRIAS</h1>
      </header>

      {/* 🔸 Lista horizontal de miniaturas (mantendo as chaves) */}
      <section className="overflow-x-auto flex space-x-4 px-3 mt-10 py-2 scroll-hide">
        {events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col items-center w-20 sm:w-24 flex-shrink-0 cursor-pointer"
              onClick={() => handleNavigate(event.chave_id)}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden  hover:shadow-xl transition-shadow duration-200">
                <img
                  src={
                    event.design_url ||
                    event.cover_image_url ||
                    "/img/memoria-placeholder.jpg"
                  }
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-center text-muted-foreground mt-1">
                {event.serial_number ? `#${event.serial_number}` : "#00000"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">Nenhum evento disponível</p>
        )}
      </section>

      {/* 🔹 Feed de Memórias */}
      <main className="flex-1 overflow-y-auto px-3 py-4 space-y-4 mb-10">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => handleNavigate(event.chave_id)}
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground mt-10 text-lg">
            Nenhum evento encontrado
          </p>
        )}
      </main>

      {/* 🧩 CSS para esconder scroll horizontal */}
      <style>{`
        .scroll-hide::-webkit-scrollbar {
          display: none;
        }
        .scroll-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
