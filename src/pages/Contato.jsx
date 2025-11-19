// src/pages/Contato.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Contato() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#07080b] text-white min-h-screen antialiased">

      {/* HEADER */}
      <header className="w-full top-0 left-0 z-50 backdrop-blur-md bg-white/5 border-b border-white/6 fixed">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          <div
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img src="/favicon.ico" alt="MEMORIAS" className="w-10 h-10 rounded-md" />
            <span className="font-semibold tracking-wide text-lg">MEMORIAS</span>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-semibold shadow"
          >
            Voltar
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">

          <h1 className="text-4xl font-bold mb-3">Fale Conosco</h1>
          <p className="text-gray-300 max-w-xl mx-auto mb-10">
            Estamos prontos para ajudar com dúvidas, parcerias e suporte.
          </p>

          <div className="space-y-8 text-gray-300 text-lg">

            <div>
              <h2 className="text-xl font-semibold text-cyan-300">E-mail Geral</h2>
              <p>contato@memorias.app.br</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-cyan-300">Privacidade</h2>
              <p>privacidade@memorias.app.br</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-cyan-300">Supporte</h2>
              <p>supporte@memorias.app.br</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-cyan-300">WhatsApp</h2>
              <p>+55 62 98245-4242</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-cyan-300">Horário de Atendimento</h2>
              <p>Segunda a Sexta · 09h às 18h</p>
            </div>

          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-10 border-t border-white/6 text-center text-gray-400">
        © {new Date().getFullYear()} MEMORIAS — Todos os direitos reservados.
      </footer>
    </div>
  );
}
