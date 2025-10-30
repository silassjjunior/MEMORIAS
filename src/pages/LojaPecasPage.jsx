// src/pages/LojaPecasPage.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export default function LojaPecasPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const [creditos, setCreditos] = useState(0);
  const [pecasGanhas, setPecasGanhas] = useState([]);
  const [indicePecaAtual, setIndicePecaAtual] = useState(0);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [engineLoaded, setEngineLoaded] = useState(false);
  const [vitrineDiaria, setVitrineDiaria] = useState([]);

  // Inicializa partículas
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineLoaded(true));
  }, []);

  // Carrega dados
  useEffect(() => {
    if (user) {
      carregarCreditos();
      carregarVitrineDiaria();
    }
  }, [user]);

  async function carregarCreditos() {
    const { data, error } = await supabase
      .from("Users")
      .select("credito")
      .eq("id", user.id)
      .single();
    if (!error && data) setCreditos(data.credito || 0);
  }

  async function carregarVitrineDiaria() {
    const hojeStr = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("loja_pecas_diarias")
      .select("*, peca_id(*)")
      .eq("data_vitrine", hojeStr);

    if (!error && data) {
      const pecas = data.map((d) => d.peca_id);
      pecas.forEach((p) => new Image().src = p.url);
      setVitrineDiaria(pecas);
    }
  }

  const adicionarPeca = async (userId, peca) => {
    try {
      const { data: existente } = await supabase
        .from("user_pecas")
        .select("id, quantidade")
        .eq("user_id", userId)
        .eq("peca_id", peca.id)
        .single();

      if (existente) {
        await supabase
          .from("user_pecas")
          .update({ quantidade: existente.quantidade + 1 })
          .eq("id", existente.id);
      } else {
        await supabase.from("user_pecas").insert({
          user_id: userId,
          peca_id: peca.id,
          quantidade: 1,
        });
      }

      await supabase.rpc("increment_peca_quantidade", { peca_id: peca.id });
      return true;
    } catch (err) {
      console.error("Erro ao adicionar peça:", err);
      return false;
    }
  };

  const custoPorRaridade = (raridade) => {
    switch (raridade) {
      case "comum": return 100;
      case "raro": return 150;
      case "épico": return 200;
      case "lendário": return 250;
      default: return 100;
    }
  };

  const corParticulasPorRaridade = (raridade) => {
    switch (raridade) {
      case "comum": return "#ffffff";
      case "raro": return "#35ff27ff";
      case "épico": return "#ffd902ff";
      case "lendário": return "#8605ffff";
      default: return "#ffffff";
    }
  };

  const comprarPecaAleatoria = async () => {
    if (loading || creditos < 150)
      return setMensagem("💰 Créditos insuficientes (150 necessários).");
    if (!vitrineDiaria.length)
      return setMensagem("Nenhuma peça disponível hoje.");
    setLoading(true);

    const peca = vitrineDiaria[Math.floor(Math.random() * vitrineDiaria.length)];
    const success = await adicionarPeca(user.id, peca);
    if (success) {
      await supabase.from("Users").update({ credito: creditos - 150 }).eq("id", user.id);
      setCreditos((prev) => prev - 150);
      setPecasGanhas([peca]);
      setIndicePecaAtual(0);
    }
    setLoading(false);
  };

  const comprarPacote = async () => {
    if (loading || creditos < 500)
      return setMensagem("💰 Créditos insuficientes (500 necessários).");
    if (!vitrineDiaria.length)
      return setMensagem("Nenhuma peça disponível hoje.");
    setLoading(true);

    const pecasEscolhidas = [];
    for (let i = 0; i < 5; i++) {
      const peca = vitrineDiaria[Math.floor(Math.random() * vitrineDiaria.length)];
      const success = await adicionarPeca(user.id, peca);
      if (success) pecasEscolhidas.push(peca);
    }

    if (pecasEscolhidas.length) {
      await supabase.from("Users").update({ credito: creditos - 500 }).eq("id", user.id);
      setCreditos((prev) => prev - 500);
      setPecasGanhas(pecasEscolhidas);
      setIndicePecaAtual(0);
    }
    setLoading(false);
  };

  const comprarVitrine = async (peca) => {
    const custo = custoPorRaridade(peca.raridade);
    if (loading || creditos < custo)
      return setMensagem(`💰 Créditos insuficientes (${custo} necessários).`);
    setLoading(true);

    const success = await adicionarPeca(user.id, peca);
    if (success) {
      await supabase.from("Users").update({ credito: creditos - custo }).eq("id", user.id);
      setCreditos((prev) => prev - custo);
      setPecasGanhas([peca]);
      setIndicePecaAtual(0);
    }
    setLoading(false);
  };

  const continuarProximaPeca = () => {
    if (indicePecaAtual < pecasGanhas.length - 1) {
      setIndicePecaAtual((i) => i + 1);
    } else {
      setPecasGanhas([]);
      setIndicePecaAtual(0);
    }
  };

  const pecaAtual = pecasGanhas[indicePecaAtual];

  return (
    <div
      className={`relative flex flex-col items-center p-8 min-h-screen overflow-hidden transition-colors duration-300 ${
        darkMode ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-900"
      }`}
    >
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">🛍️ Loja de Peças</h1>
        <div className="mb-6 text-lg">
          Créditos:{" "}
          <span className="text-green-400 font-semibold">{creditos}</span>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full">
          <button
            onClick={comprarPecaAleatoria}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 transition px-6 py-3 rounded-xl font-medium shadow-lg disabled:opacity-50"
          >
            {loading ? "Processando..." : "🎲 Peça Aleatória (150 créditos)"}
          </button>

          <button
            onClick={comprarPacote}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 transition px-4 py-3 rounded-xl font-medium shadow-lg disabled:opacity-50"
          >
            📦 Pacote (5 peças por 500 créditos)
          </button>
        </div>

        {/* Vitrine */}
        <h2 className="text-xl font-semibold mb-4">💎 Vitrine do Dia</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 w-full mb-10">
          {vitrineDiaria.map((p, idx) => (
            <div
              key={p.id + "_" + idx}
              className={`rounded-2xl shadow p-3 flex flex-col items-center hover:scale-105 transition cursor-pointer ${
                darkMode ? "bg-zinc-900" : "bg-zinc-200"
              }`}
              onClick={() => comprarVitrine(p)}
            >
              <img src={p.url} alt={p.nome} className="w-20 h-20 object-contain mb-2" />
              <span className="font-semibold text-sm">{p.nome}</span>
              <span className="font-semibold text-sm">{p.camada}</span>
              <span className="text-xs text-indigo-400 mt-1">{p.raridade}</span>
              <span className="text-xs text-gray-500 mt-1">
                {custoPorRaridade(p.raridade)} créditos
              </span>
            </div>
          ))}
        </div>

        {mensagem && (
          <div className="mt-4 text-sm text-gray-300">{mensagem}</div>
        )}
      </div>

      {/* Tela de Peça Ganha */}
      {pecasGanhas.length > 0 && pecaAtual && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center"
        >
          {engineLoaded && (
            <Particles
              id="tsparticles"
              options={{
                background: { color: "transparent" },
                particles: {
                  color: { value: corParticulasPorRaridade(pecaAtual.raridade) },
                  shadow: { color: corParticulasPorRaridade(pecaAtual.raridade), blur: 8, enable: true, size: 5 },
                  move: { enable: true, speed: 1.8 },
                  number: { value: 190 },
                  opacity: { value: 0.8 },
                  size: { value: { min: 2, max: 4 } },
                  shape: { type: "circle" },
                },
              }}
              className="absolute inset-0 z-0"
            />
          )}

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: [0.6, 1.15, 1.0],
              opacity: [0, 1, 1],
            }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            className="relative flex flex-col items-center z-10"
          >
            <img
              src={pecaAtual.url}
              alt={pecaAtual.nome}
              className="w-72 h-72 object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]"
            />
            <h2 className="text-2xl font-bold mt-3">{pecaAtual.nome}</h2>
            <p className="text-gray-300">{pecaAtual.colecao}</p>
            <p className="text-sm text-indigo-400 capitalize mt-1">
              {pecaAtual.raridade}
            </p>
          </motion.div>

          <button
            onClick={continuarProximaPeca}
            className="mt-6 z-10 bg-zinc-800 hover:bg-zinc-700 px-5 py-2 rounded-lg text-white shadow-lg"
          >
            {indicePecaAtual < pecasGanhas.length - 1 ? "Continuar" : "Fechar"}
          </button>
        </motion.div>
      )}
    </div>
  );
}
