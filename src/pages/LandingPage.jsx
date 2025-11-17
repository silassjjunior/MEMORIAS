import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, LockIcon, Layers } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-[#0b0e13] text-white overflow-x-hidden font-sans">
      {/* NAVBAR */}
      <header className="w-full fixed top-0 left-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="logo" className="w-10 h-10 rounded-lg" />
            <h1 className="text-xl font-semibold tracking-wide">MEMORIAS</h1>
          </div>

          <nav className="hidden md:flex gap-10 text-sm opacity-90">
            <a href="#como" className="hover:text-cyan-300 transition">Como funciona</a>
            <a href="#trofeu" className="hover:text-cyan-300 transition">Troféu Digital</a>
            <a href="#piloto" className="hover:text-cyan-300 transition">Eventos Piloto</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-32 pb-32 px-6 relative">
        {/* Glow background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[160px] absolute -top-20 -left-20"></div>
          <div className="w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[180px] absolute bottom-0 right-0"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            O futuro das <span className="text-cyan-300">memórias digitais</span>
          </h1>
          <p className="text-lg md:text-xl mt-6 opacity-90 max-w-2xl mx-auto">
            Transforme qualquer evento em um espaço exclusivo e seguro de lembranças,
            com troféus digitais colecionáveis e um feed privado entre os participantes.
          </p>

          <Link
            to="/login"
            className="mt-10 inline-block px-10 py-4 rounded-2xl bg-cyan-400/90 hover:bg-cyan-300 text-black font-semibold text-lg shadow-lg shadow-cyan-500/30 transition"
          >
            Criar meu evento grátis
          </Link>
        </motion.div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" className="py-28 px-6 bg-[#0d1117] border-t border-white/10">
        <h2 className="text-4xl font-bold text-center mb-14">Como funciona</h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl hover:border-cyan-400/40 transition">
            <Sparkles className="w-10 h-10 text-cyan-300 mb-5" />
            <h3 className="text-2xl font-semibold mb-3">1. Crie o evento</h3>
            <p className="opacity-80">Defina nome, data e personalize o troféu digital exclusivo.</p>
          </div>

          <div className="p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl hover:border-cyan-400/40 transition">
            <ShieldCheck className="w-10 h-10 text-cyan-300 mb-5" />
            <h3 className="text-2xl font-semibold mb-3">2. Compartilhe a chave</h3>
            <p className="opacity-80">Você recebe um link + QR Code para enviar aos participantes.</p>
          </div>

          <div className="p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl hover:border-cyan-400/40 transition">
            <Layers className="w-10 h-10 text-cyan-300 mb-5" />
            <h3 className="text-2xl font-semibold mb-3">3. Upload + feed privado</h3>
            <p className="opacity-80">Todos enviam fotos e vídeos e acessam as memórias do evento.</p>
          </div>
        </div>
      </section>

      {/* TROFÉU DIGITAL */}
      <section id="trofeu" className="py-28 px-6 relative">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="w-[500px] h-[500px] bg-purple-500/20 blur-[200px] rounded-full absolute left-1/2 -translate-x-1/2 -top-10" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10">Troféu Digital</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-16">
            Cada evento ganha um troféu digital exclusivo — um colecionável tecnológico
            que funciona como chave de acesso às memórias privadas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl">
              <span className="text-cyan-300 font-semibold text-lg">Design único</span>
            </div>
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl">
              <span className="text-cyan-300 font-semibold text-lg">Quantidade limitada</span>
            </div>
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl">
              <span className="text-cyan-300 font-semibold text-lg">Colecionável + seguro</span>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTOS PILOTO */}
      <section id="piloto" className="py-28 px-6 bg-[#0d1117] border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Eventos Piloto — 100% Gratuito</h2>
          <p className="opacity-90 text-lg max-w-2xl mx-auto mb-12">
            Estamos abrindo vagas para eventos que desejam testar o MEMORIAS antes do lançamento oficial.
            Inclui troféu personalizado, QR Code e upload ilimitado.
          </p>

          <Link 
            to="/login"
            className="px-10 py-4 bg-cyan-400/90 hover:bg-cyan-300 text-black font-semibold rounded-2xl shadow-lg shadow-cyan-500/20 transition"
          >
            Quero testar no meu evento
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-white/10 text-center bg-[#0b0e13]">
        <p className="opacity-80">MEMORIAS © 2025 — Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}