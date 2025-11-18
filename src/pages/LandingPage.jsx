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
   HOOK: autoplay simples
   ============================ */
function useAutoPlay(size) {
  const [index, setIndex] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!size || size <= 1) return;
    const id = setInterval(() => {
      if (mountedRef.current) setIndex((p) => (p + 1) % size);
    }, INTERVALO);
    return () => clearInterval(id);
  }, [size]);

  return { index, setIndex };
}

/* ============================
   HERO: Eventos de Amostra
   - busca events + memories
   - autoplay, touch, tilt troféu + tilt leve no card
   - skeleton neon
   ============================ */
function HeroEventsShowcase() {
  const [items, setItems] = useState([]); // {id,name,design_url,photos:[]}
  const [loading, setLoading] = useState(true);

  const { index, setIndex } = useAutoPlay(items.length);

  // touch handlers
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const loaded = [];
      for (const id of DEMO_IDS) {
        try {
          const { data: ev, error: evErr } = await supabase
            .from("events")
            .select("id, name, design_url")
            .eq("id", id)
            .single();

          if (evErr || !ev) continue;

          const { data: photosData } = await supabase
            .from("memories")
            .select("file_url")
            .eq("event_id", id)
            .eq("privacy", "public")
            .eq("featured", true)
            .order("created_at", { ascending: true })
            .limit(3);

          const photos = (photosData || []).map((p) => p.file_url);
          loaded.push({
            id: ev.id,
            name: ev.name,
            design_url: ev.design_url,
            photos
          });
        } catch (err) {
          console.error("Erro carregando evento demo", id, err);
        }
      }
      if (mounted) {
        setItems(loaded);
        setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  // swipe/touch
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
      // swipe right -> previous
      setIndex((items.length + (index - 1)) % items.length);
    } else if (d < -DRAG_THRESHOLD) {
      // swipe left -> next
      setIndex((index + 1) % items.length);
    }
    touchDeltaX.current = 0;
    touchStartX.current = 0;
  }

  if (loading) {
    // skeleton neon
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

  if (!items || items.length === 0) {
    return (
      <div className="mt-8 text-center text-gray-400">
        Nenhum evento de amostra disponível no momento.
      </div>
    );
  }

  const ev = items[index];

  // tilt handlers: troféu (forte) and card (leve)
  function handleTrophyTilt(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * 10;
    const ry = (0.5 - px) * 10;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.06)`;
  }
  function resetTrophyTilt(e) {
    e.currentTarget.style.transform = "";
  }

  function handleCardTilt(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * 4;
    const ry = (0.5 - px) * 4;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  }
  function resetCardTilt(e) {
    e.currentTarget.style.transform = "";
  }

  return (
    <div
      className="mt-8"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="max-w-6xl mx-auto p-6 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden"
        onMouseMove={handleCardTilt}
        onMouseLeave={resetCardTilt}
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
                onMouseMove={handleTrophyTilt}
                onMouseLeave={resetTrophyTilt}
                className="w-56 md:w-64 lg:w-72 rounded-xl p-4 bg-black/20 border border-white/8 shadow-2xl transition-transform"
                style={{ transformStyle: "preserve-3d" }}
              >
                <img
                  src={ev.design_url}
                  alt={`Troféu ${ev.name}`}
                  className="w-full h-48 md:h-56 object-contain"
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
                    <img src={p} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
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
            to="/loginPage"
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
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-all ${i === index ? "bg-cyan-300 scale-105" : "bg-white/20"}`}
            aria-label={`Ir para ${i + 1}`}
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
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ============================
   COPYWRITING MELHORADO
   - pequenas melhorias nas copys das seções
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

          <nav className="hidden md:flex gap-8 items-center text-sm opacity-90">
            <a href="#home" onClick={(e) => handleNav(e, "home")} className="hover:text-cyan-300">Home</a>
            <a href="#organizador" onClick={(e) => handleNav(e, "organizador")} className="hover:text-cyan-300">Organizadores</a>
            <a href="#fotografo" onClick={(e) => handleNav(e, "fotografo")} className="hover:text-cyan-300">Fotógrafos</a>
            <a href="#buffet" onClick={(e) => handleNav(e, "buffet")} className="hover:text-cyan-300">Buffets</a>
            <a href="#criador" onClick={(e) => handleNav(e, "criador")} className="hover:text-cyan-300">Criadores</a>
            <Link to="/loginPage" className="ml-4 px-4 py-2 rounded-xl bg-cyan-400 text-black font-semibold shadow">Comece Agora</Link>
          </nav>

          <div className="md:hidden">
            <Link to="/loginPage" className="px-3 py-2 rounded-lg bg-cyan-400 text-black font-semibold text-sm">Comece</Link>
          </div>
        </div>
      </header>

      <main className="">
        {/* HERO */}
        <section id="home" className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-[700px] h-[700px] bg-cyan-600/12 blur-[140px] rounded-full -left-40 -top-40" />
            <div className="w-[600px] h-[600px] bg-purple-600/8 blur-[160px] rounded-full -right-36 bottom-10 absolute" />
          </div>

          <div className="max-w-6xl mx-auto px-6 py-18 relative z-10 text-center md:text-left">
            <motion.h1
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold leading-tight"
            >
              MEMORIAS — <span className="text-cyan-300">A Experiência</span> que transforma seu evento em história
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className=" text-lg text-gray-200 max-w-2xl"
            >
              Veja como eventos reais se transformam em memórias vivas dentro do MEMORIAS.
              Um novo padrão para convidados, organizadores e criadores — privacidade, design e valor em um só lugar.
            </motion.p>

            {/* CARROSSEL DE EVENTOS (HERO) */}
            <HeroEventsShowcase />
          </div>
        </section>

        {/* ORGANIZADORES */}
        <section id="organizador" className="py-1 px-6 bg-[#071018]">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold">Para Organizadores</h3>
              <p className="mt-4 text-gray-300">
                Aumente o valor percebido dos seus eventos — entregue uma experiência digital exclusiva aos seus clientes
                e centralize todas as memórias sem complicação.
              </p>

              <ul className="mt-4 space-y-2 text-gray-300">
                <li>• QR Code no convite — convidados enviam fotos em segundos</li>
                <li>• Centralização automática do material</li>
                <li>• Troféus digitais para agregar valor ao pacote</li>
              </ul>

              <div className="mt-6">
                <Link to="/loginPage" className="px-1 py-3 rounded-2xl bg-cyan-400 text-black font-semibold">Criar Meu Evento</Link>
              </div>
            </div>

            <div className="p-6 bg-white/4 rounded-2xl border border-white/6">
              <div className="text-sm text-gray-200 font-medium">Case rápido</div>
              <div className="mt-3 text-gray-100">“Evento X reduziu o tempo de coleta de fotos em 70% e aumentou o engajamento dos convidados.”</div>
            </div>
          </div>
        </section>

        {/* FOTÓGRAFOS */}
        <section id="fotografo" className="py-10 px-6 border-t border-white/6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="p-6 bg-white/4 rounded-2xl border border-white/6">
                <div className="text-sm text-gray-200 font-medium">Vantagem</div>
                <div className="mt-3 text-gray-100">Entregue ao cliente um produto final completo com todas as fotos reunidas.</div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold">Para Fotógrafos</h3>
              <p className="mt-4 text-gray-300">Integre seu fluxo e ofereça ao cliente um pacote moderno: troféu digital + galeria privada.</p>

              <ul className="mt-4 space-y-2 text-gray-300">
                <li>• Material organizado por evento</li>
                <li>• Exposição do portfólio dentro da plataforma</li>
                <li>• Oportunidade de ganhar indicações</li>
              </ul>

              <div className="mt-6">
                <Link to="/loginPage" className="px-6 py-3 rounded-2xl bg-cyan-400 text-black font-semibold">Quero usar no meu próximo evento</Link>
              </div>
            </div>
          </div>
        </section>

        {/* BUFFETS */}
        <section id="buffet" className="py-10 px-6 bg-[#071018]">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold">Para Buffets e Casas de Festa</h3>
              <p className="mt-4 text-gray-300">Destaque sua casa com um diferencial digital que encanta no pós-evento.</p>

              <ul className="mt-4 space-y-2 text-gray-300">
                <li>• Aumente o ticket médio com um serviço diferenciado</li>
                <li>• Conteúdo pronto para redes sociais</li>
              </ul>

              <div className="mt-6">
                <Link to="/loginPage" className="px-6 py-3 rounded-2xl bg-cyan-400 text-black font-semibold">Começar Agora</Link>
              </div>
            </div>

            <div className="p-6 bg-white/4 rounded-2xl border border-white/6">
              <div className="text-sm text-gray-200 font-medium">Exemplo</div>
              <div className="mt-3 text-gray-100">“Casa Y aumentou reservas em eventos corporativos.”</div>
            </div>
          </div>
        </section>

        {/* CRIADORES */}
        <section id="criador" className="py-10 px-6 border-t border-white/6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold">Para Criadores de Conteúdo</h3>
              <p className="mt-4 text-gray-300">Monetize momentos exclusivos e entregue troféus colecionáveis para sua comunidade.</p>

              <ul className="mt-4 space-y-2 text-gray-300">
                <li>• Conteúdo exclusivo para fãs</li>
                <li>• Experiências monetizáveis via troféus</li>
              </ul>

              <div className="mt-6">
                <Link to="/loginPage" className="px-6 py-3 rounded-2xl bg-cyan-400 text-black font-semibold">Quero ativar no meu evento</Link>
              </div>
            </div>

            <div className="p-6 bg-white/4 rounded-2xl border border-white/6">
              <div className="text-sm text-gray-200 font-medium">Oportunidade</div>
              <div className="mt-3 text-gray-100">“Criador Z lançou troféus exclusivos — fãs pagaram e engajamento subiu 3x.”</div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-10 px-6 bg-gradient-to-tr from-cyan-900/30 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold">Pronto para transformar seu próximo evento?</h3>
            <p className="mt-3 text-gray-300">Comece agora gratuitamente e entregue uma experiência que seus convidados vão lembrar para sempre.</p>

            <div className="mt-8">
              <Link to="/loginPage" className="px-8 py-4 rounded-2xl bg-cyan-400 text-black font-semibold">Começar Agora</Link>
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

              <div className="text-sm text-gray-400">© {new Date().getFullYear()} MEMORIAS · Termos · Privacidade · Contato</div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
