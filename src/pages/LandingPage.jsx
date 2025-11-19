// src/pages/CommercialSite.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

/* ============================
   CONFIGURAÇÃO DE EVENTOS
   ============================ */
const DEMO_IDS = [
  "1de3c32b-7787-4c74-aa89-8bf352037dc8",
  "b0bd57e2-d790-4dda-8a11-ccb4216687ad",
  "128c526f-e1f9-4d9a-a8f2-e13fdd31a6c8",
  "a8cb340c-132f-4283-b1f3-45cf7670d63d",
  "9bce4655-a2ab-4ee6-b394-df569bfffc4f"
];

const INTERVALO = 4500; // autoplay (ms)
const DRAG_THRESHOLD = 50; // px for swipe

/* ============================
   UTIL: trackEvent (placeholder)
   - substitua por GA4/Segment/Pixels quando quiser
   ============================ */
function trackEvent(eventName, payload = {}) {
  // mínimo seguro: console + window.dataLayer (se existir)
  console.log("[trackEvent]", eventName, payload);
  if (window && window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...payload });
  }
}

/* ============================
   HOOK: autoplay com Visibility API
   ============================ */
function useAutoPlay(size) {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const handleVisibility = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (!size || size <= 1) return;
    function tick() {
      if (!isVisibleRef.current) return;
      setIndex((p) => (p + 1) % size);
    }
    intervalRef.current = setInterval(tick, INTERVALO);
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [size]);

  // keep index within bounds if size changes
  useEffect(() => {
    setIndex((i) => (size ? i % size : 0));
  }, [size]);

  return { index, setIndex };
}

/* ============================
   HELPERS DE IMAGEM
   - lazy load, decoding async, pequenas melhorias de srcset
   ============================ */
function generateBasicSrcSet(url) {
  // fallback safe: same url for different densities (if no transforms available)
  // If in the future you enable CDN/transforms, change this function to return proper urls.
  return `${url} 1x, ${url} 2x`;
}

function safeAlt(evName, i) {
  return evName ? `${evName} — foto ${i + 1}` : `foto ${i + 1}`;
}

/* ============================
   HERO: Eventos de Amostra (refatorado)
   - busca batched no Supabase (1 req events + 1 req memories)
   - lazy images, acessibilidade, RAF para tilt
   ============================ */
function HeroEventsShowcase() {
  const [items, setItems] = useState([]); // {id,name,design_url,photos:[]}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { index, setIndex } = useAutoPlay(items.length);

  // touch handlers
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  // tilt raf refs
  const trophyRef = useRef(null);
  const cardRef = useRef(null);
  const rafRef = useRef(null);
  const latestPointer = useRef({ x: 0, y: 0, el: null, type: "card" });

  useEffect(() => {
    let mounted = true;

    async function loadBatched() {
      try {
        // 1) fetch events in batch
        const { data: evs, error: evsErr } = await supabase
          .from("events")
          .select("id, name, design_url")
          .in("id", DEMO_IDS);

        if (evsErr) {
          console.error("Erro events batch", evsErr);
          throw evsErr;
        }

        // 2) fetch memories in batch
        const { data: photosData, error: photosErr } = await supabase
          .from("memories")
          .select("event_id, file_url, created_at")
          .in("event_id", DEMO_IDS)
          .eq("privacy", "public")
          .eq("featured", true)
          .order("created_at", { ascending: true });

        if (photosErr) {
          console.error("Erro memories batch", photosErr);
          throw photosErr;
        }

        // group photos by event_id and take up to 3 each
        const photosByEvent = {};
        (photosData || []).forEach((p) => {
          if (!photosByEvent[p.event_id]) photosByEvent[p.event_id] = [];
          if (photosByEvent[p.event_id].length < 3) photosByEvent[p.event_id].push(p.file_url);
        });

        const loaded = (evs || [])
          // preserve order of DEMO_IDS
          .sort((a, b) => DEMO_IDS.indexOf(a.id) - DEMO_IDS.indexOf(b.id))
          .map((ev) => ({
            id: ev.id,
            name: ev.name,
            design_url: ev.design_url,
            photos: photosByEvent[ev.id] || []
          }));

        if (mounted) {
          setItems(loaded);
          setLoading(false);
          trackEvent("hero_loaded", { count: loaded.length });
        }
      } catch (err) {
        console.error("Erro carregando hero batched", err);
        if (mounted) {
          setError("Erro ao carregar eventos de amostra.");
          setLoading(false);
        }
      }
    }

    loadBatched();

    return () => {
      mounted = false;
    };
  }, []);

  // touch handlers
  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }
  function onTouchMove(e) {
    const x = e.touches[0].clientX;
    touchDeltaX.current = x - touchStartX.current;
  }
  function onTouchEnd() {
    const d = touchDeltaX.current;
    if (d > DRAG_THRESHOLD) {
      setIndex((items.length + (index - 1)) % items.length);
      trackEvent("hero_swipe", { direction: "right", index });
    } else if (d < -DRAG_THRESHOLD) {
      setIndex((index + 1) % items.length);
      trackEvent("hero_swipe", { direction: "left", index });
    }
    touchDeltaX.current = 0;
    touchStartX.current = 0;
  }

  if (loading) {
    // skeleton neon (mantive sua aparência)
    return (
      <div className="mt-8">
        <div className="max-w-6xl mx-auto p-6 bg-white/5 border border-white/10 rounded-3xl">
          <div className="animate-pulse flex gap-6 flex-col md:flex-row">
            <div className="w-full md:w-1/2">
              <div className="w-56 h-56 md:w-64 md:h-64 bg-white/6 rounded-xl mb-4" />
              <div className="h-6 bg-white/6 rounded w-3/4 mb-2" />
              <div className="h-4 bg-white/6 rounded w-1/2 mb-2" />
            </div>
            <div className="flex-1 grid grid-cols-3 gap-3">
              <div className="h-32 bg-white/6 rounded-xl" />
              <div className="h-32 bg-white/6 rounded-xl" />
              <div className="h-32 bg-white/6 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 text-center text-red-400">
        {error} — <Link to="/login" className="underline">Comece agora</Link>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="mt-8 text-center text-gray-400">
        Nenhum evento de amostra disponível no momento.
      </div>
    );
  }

  const ev = items[index];

  /* ============================
     Tilt: requestAnimationFrame approach
     - guardamos último pointer e aplicamos transform via RAF
     - isso reduz tráfego no main thread
     ============================ */
  function applyTilt(el, clientX, clientY, intensity = 4, scale = 1) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * intensity;
    const ry = (0.5 - px) * intensity;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
  }

  function onPointerMove(e, type = "card") {
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
    latestPointer.current = { x: clientX, y: clientY, type };
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        const { x, y, type } = latestPointer.current;
        if (type === "trophy") {
          applyTilt(trophyRef.current, x, y, 10, 1.06);
        } else {
          applyTilt(cardRef.current, x, y, 4, 1);
        }
        rafRef.current = null;
      });
    }
  }

  function resetTilt(el) {
    if (!el) return;
    el.style.transition = "transform 220ms ease";
    el.style.transform = "";
    // remove transition after animation to avoid keeping it
    setTimeout(() => {
      if (el) el.style.transition = "";
    }, 240);
  }

  return (
    <div
      className="mt-8"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        ref={cardRef}
        className="max-w-6xl mx-auto p-6 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden"
        onMouseMove={(e) => onPointerMove(e, "card")}
        onMouseLeave={() => resetTilt(cardRef.current)}
        onTouchMove={(e) => onPointerMove(e, "card")}
      >
        {/* holographic background lights */}
        <div className="absolute inset-0 pointer-events-none mix-blend-screen">
          <div className="absolute -left-28 -top-20 w-80 h-80 bg-cyan-400/18 blur-[120px] rounded-full"></div>
          <div className="absolute -right-20 -bottom-16 w-72 h-72 bg-purple-400/14 blur-[120px] rounded-full"></div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
          >
            {/* TROFÉU + NAME */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <motion.div
                ref={trophyRef}
                onMouseMove={(e) => onPointerMove(e, "trophy")}
                onMouseLeave={() => resetTilt(trophyRef.current)}
                className="w-56 md:w-64 lg:w-72 rounded-xl p-4 bg-black/20 border border-white/8 shadow-2xl transition-transform"
                style={{ transformStyle: "preserve-3d" }}
                aria-hidden={false}
              >
                <img
                  src={ev.design_url}
                  srcSet={generateBasicSrcSet(ev.design_url)}
                  alt={`Troféu ${ev.name}`}
                  className="w-full h-48 md:h-56 object-contain"
                  loading="lazy"
                  decoding="async"
                />
                {/* subtle glare */}
                <div className="pointer-events-none absolute inset-0 mix-blend-screen">
                  <div className="absolute left-0 top-0 w-32 h-32 bg-white/5 blur-xl rounded-full transform -translate-x-6 -translate-y-6" />
                </div>
              </motion.div>

              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold">{ev.name}</h3>
              </div>
            </div>

            {/* PHOTOS */}
            <div className="grid grid-cols-3 gap-3">
              {ev.photos && ev.photos.length > 0 ? (
                ev.photos.map((p, i) => (
                  <div
                    key={i}
                    className="h-28 md:h-40 bg-black/40 rounded-xl overflow-hidden border border-white/8"
                  >
                    <img
                      src={p}
                      srcSet={generateBasicSrcSet(p)}
                      alt={safeAlt(ev.name, i)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))
              ) : (
                // fallback single placeholder
                <div className="col-span-3 h-40 bg-black/40 rounded-xl flex items-center justify-center text-gray-400">
                  Sem fotos destacadas
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* CTA row */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-gray-200 text-sm">Crie uma chave para seu evento.</div>
          <Link
            to="/login"
            onClick={() => trackEvent("cta_click", { location: "hero", label: "Comece Agora" })}
            className=" py-3 rounded-xl bg-cyan-300 text-black font-semibold shadow hover:bg-cyan-200 transition"
          >
            Comece Agora
          </Link>
        </div>
      </div>

      {/* bullets / controls */}
      <div className="flex justify-center gap-3 mt-4">
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => {
              setIndex(i);
              trackEvent("hero_dot_click", { index: i });
            }}
            className={`w-3 h-3 rounded-full transition-all ${i === index ? "bg-cyan-300 scale-105" : "bg-white/20"}`}
            aria-label={`Ir para ${i + 1}`}
            aria-current={i === index ? "true" : "false"}
            aria-pressed={i === index}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================
   FUNÇÃO DE SCROLL GLOBAL
   ============================ */
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ============================
   COPYWRITING MELHORADO
   ============================ */

export default function CommercialSite() {
  const handleNav = useCallback((e, id) => {
    e.preventDefault();
    scrollToId(id);
  }, []);

  return (
    <div className="bg-[#07080b] text-white min-h-screen antialiased">
      {/* NAVBAR */}
      <header className="fixed w-full top-0 left-0 z-50 backdrop-blur-md bg-white/5 border-b border-white/6">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="MEMORIAS" className="w-10 h-10 rounded-md" />
            <span className="font-semibold tracking-wide">MEMORIAS</span>
          </div>

          <nav className="hidden md:flex gap-8 items-center text-sm opacity-90" aria-label="Main navigation">
            <a href="#home" onClick={(e) => handleNav(e, "home")} className="hover:text-cyan-300">Home</a>
            <Link
              to="/login"
              onClick={() => trackEvent("cta_click", { location: "navbar", label: "Comece Agora" })}
              className="ml-4 px-4 py-2 rounded-xl bg-cyan-400 text-black font-semibold shadow"
            >
              Entrar
            </Link>
          </nav>

          <div className="md:hidden">
            <Link
              to="/login"
              onClick={() => trackEvent("cta_click", { location: "navbar_mobile", label: "Comece" })}
              className="px-3 py-2 rounded-lg bg-cyan-400 text-black font-semibold text-sm"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="">
        {/* HERO */}
        <section id="home" className="relative overflow-hidden pt-20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-[700px] h-[700px] bg-cyan-600/12 blur-[140px] rounded-full -left-40 -top-40" />
            <div className="w-[600px] h-[600px] bg-purple-600/8 blur-[160px] rounded-full -right-36 bottom-10 absolute" />
          </div>

          <div className="max-w-6xl mx-auto px-6 py-6 relative z-10 text-center md:text-left">
            <motion.h1
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold leading-tight"
            >
              Transforme seus <span className="text-cyan-300">Eventos</span>  em uma experiência digital que vive para sempre. 
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className=" py-6 text-lg text-gray-200 max-w-2xl"
            >
             Crie um espaço único para o seu evento, onde cada convidado pode registrar suas fotos, compartilhar memórias e participar de um feed colaborativo.
             Como organizador, você ainda conta com um ambiente exclusivo para revelar conteúdos especiais a todos.
            </motion.p>

            {/* CARROSSEL DE EVENTOS (HERO) */}
            <HeroEventsShowcase />
          </div>
        </section>

        {/* ORGANIZADORES */}
        <section id="organizador" className="py-1 px-6 bg-[#071018]">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold">O novo padrão de lembrança para eventos inesquecíveis.</h3>
              <p className="mt-4 text-gray-300">
               MEMORIAS é a evolução das lembranças de eventos: uma chave personalizada que não só identifica o seu evento, ela guarda cada foto, memória e interação de todos que estiveram lá.
               É a lembrança que faz sentido hoje: útil, bonita, interativa e eterna.
              </p>

              <ul className="mt-4 space-y-2 text-gray-300">
                <li>• Memórias organizadas automaticamente — convidados enviam fotos em segundos</li>
                <li>• Feed colaborativo e divertido</li>
                <li>• Adicione o codigo no convite e conceda Acesso Antecipado ao conteudo</li>
                <li>• Forneça um Colecionavel exclusivo para os participantes</li>
                <li>• Painel exclusivo do organizador</li>
              </ul>

              <div className="mt-6">
                <Link
                  to="/login"
                  onClick={() => trackEvent("cta_click", { location: "organizador", label: "Criar Meu Evento" })}
                  className="px-1 py-3 rounded-2xl bg-cyan-400 text-black font-semibold"
                >
                  Criar Meu Evento
                </Link>
              </div>
            </div>

            <div className="p-6 bg-white/4 rounded-2xl border border-white/6">
              <div className="text-sm text-gray-200 font-medium">"Se copos, pulseiras e tirantes foram a lembranças no passado… Memorias são as Lembranças do Futuro."</div>
              <div className="mt-3 text-gray-100"> - Famoso NorT, Produtor de Eventos</div>
            </div>
          </div>
        </section>

      

        {/* CTA FINAL */}
        <section className="py-10 px-6 bg-gradient-to-tr from-cyan-900/30 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold">Pronto para transformar seu próximo evento?</h3>
            <p className="mt-3 text-gray-300">Comece agora gratuitamente e entregue uma experiência que seus convidados vão lembrar para sempre.</p>

            <div className="mt-8">
              <Link
                to="/login"
                onClick={() => trackEvent("cta_click", { location: "final_cta", label: "Começar Agora" })}
                className="px-8 py-4 rounded-2xl bg-cyan-400 text-black font-semibold"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
<footer className="py-10 border-t border-white/6 text-center">
  <div className="max-w-6xl mx-auto px-6">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">

      <div className="flex items-center gap-3">
        <img src="/favicon.ico" alt="logo" className="w-10 h-10 rounded-md" />
        <div>
          <div className="font-semibold">MEMORIAS</div>
          <div className="text-sm text-gray-400">Transforme a forma como você coleciona memórias</div>
        </div>
      </div>



      <div className="flex gap-2 text-sm text-gray-500">
        © {new Date().getFullYear()} MEMORIAS
        <div className=" text-sm text-gray-400">
          <Link to="/Termos" className="hover:text-cyan-300 transition">Termos</Link>
          <span> · </span>
          <Link to="/Privacidade" className="hover:text-cyan-300 transition">Privacidade</Link>
          <span> · </span>
          <Link to="/Contato" className="hover:text-cyan-300 transition">Contato</Link>
        </div>
      </div>
    </div>
  </div>
</footer>
      </main>
    </div>
  );
}
