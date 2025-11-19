// src/pages/Privacidade.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Privacidade() {
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
        <div className="max-w-4xl mx-auto">

          <h1 className="text-4xl font-bold mb-6">Política de Privacidade</h1>

          <div className="space-y-8 text-gray-300 leading-relaxed">

            <section>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">1. Introdução</h2>
              <p>Esta política descreve como tratamos, armazenamos e protegemos seus dados.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">2. Informações Coletadas</h2>
              <ul className="list-disc ml-5 space-y-2">
                <li>Nome, e-mail e dados de cadastro.</li>
                <li>Fotos e vídeos enviados ao evento.</li>
                <li>Informações técnicas do dispositivo.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">3. Uso das Informações</h2>
              <p>Utilizamos seus dados para: funcionamento da plataforma, segurança e comunicação essencial.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">4. Compartilhamento</h2>
              <p>Compartilhamos dados somente com convidados autorizados ou serviços essenciais.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">5. Segurança</h2>
              <p>Utilizamos criptografia, autenticação e infraestrutura segura.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">6. Contato</h2>
              <p>privacidade@memorias.app.br</p>
            </section>

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
