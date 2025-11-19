// src/pages/Termos.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Termos() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#07080b] text-white min-h-screen antialiased">

      {/* HEADER */}
      <header className="w-full top-0 left-0 z-50 backdrop-blur-md bg-white/5 border-b border-white/6 fixed">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Logo */}
          <div
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img src="/favicon.ico" alt="MEMORIAS" className="w-10 h-10 rounded-md" />
            <span className="font-semibold tracking-wide text-lg">MEMORIAS</span>
          </div>

          {/* Botão Voltar */}
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

          <h1 className="text-4xl font-bold mb-6">Termos de Uso</h1>

          <div className="space-y-8 text-gray-300 leading-relaxed">

            <section>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">1. Introdução</h2>
              <p>Ao utilizar o MEMORIAS, você concorda com estes Termos de Uso.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">2. Definições</h2>
              <ul className="list-disc ml-5 space-y-2">
                <li><b>Organizador:</b> cria eventos e gerencia permissões.</li>
                <li><b>Convidado:</b> acessa eventos através de chave.</li>
                <li><b>Fotógrafo:</b> envia conteúdos autorizados.</li>
                <li><b>Conteúdo:</b> fotos, vídeos e arquivos enviados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">3. Uso da Plataforma</h2>
              <p>
                O organizador é responsável pelas permissões e pelo publico que acessa o evento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">4. Direitos Autorais</h2>
              <p>
                Todo conteúdo enviado permanece pertencente ao autor original. O MEMORIAS apenas armazena e exibe o conteúdo conforme as permissões do evento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">5. Proibições</h2>
              <ul className="list-disc ml-5 space-y-2">
                <li>Enviar conteúdo ofensivo ou ilegal.</li>
                <li>Acessar eventos sem autorização.</li>
                <li>Violar privacidade de outros usuários.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">6. Segurança</h2>
              <p>
                Adotamos medidas modernas de segurança, mas nenhum sistema é totalmente imune.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">7. Contato</h2>
              <p>contato@memorias.app.br</p>
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
