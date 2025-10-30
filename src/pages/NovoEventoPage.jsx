import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { usePecas } from "@/contexts/PecasContext";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext"; // 👈 Adicionamos o hook do tema

// Hook para carregar imagens
function useImage(src) {
  const [image, setImage] = useState(null);
  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
  }, [src]);
  return image;
}

export default function NovoEvento() {
  const stageRef = useRef(null);
  const { user } = useAuth();
  const { pecas } = usePecas();
  const { theme } = useTheme(); // 👈 Pegamos o tema do usuário
  const dark = theme === "dark";

  const camadas = ["EFEITO", "AURA", "BASE", "ICONE", "DETALHE"];

  // Estados
  const [name, setName] = useState("");
  const [eventCodePrefix, setEventCodePrefix] = useState("");
  const [maxChaves, setMaxChaves] = useState("");
  const [loading, setLoading] = useState(false);
  const [userPecas, setUserPecas] = useState([]);
  const [selectedPecas, setSelectedPecas] = useState({
    EFEITO: null,
    AURA: null,
    BASE: null,
    ICONE: null,
    DETALHE: null,
  });
  const [selectedLayer, setSelectedLayer] = useState("BASE");
  const [engineLoaded, setEngineLoaded] = useState(false);
  const [chaveCriada, setChaveCriada] = useState(null);
  const [stageSize, setStageSize] = useState(350);

  // Inicializa partículas
  useEffect(() => {
    initParticlesEngine(async (engine) => await loadSlim(engine)).then(() =>
      setEngineLoaded(true)
    );
  }, []);

  // Responsividade do Stage
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      const size = isMobile
        ? Math.min(window.innerWidth - 40, 320)
        : Math.min(window.innerWidth * 0.9, 500);
      setStageSize(size);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Busca peças do usuário
  const fetchUserPecas = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_pecas")
      .select("peca_id, quantidade")
      .eq("user_id", user.id);
    if (error) {
      console.error("Erro ao buscar user_pecas:", error);
      setUserPecas([]);
    } else setUserPecas(data || []);
  };
  useEffect(() => {
    fetchUserPecas();
  }, [user]);

  // Carrega imagens no stage
  const imagens = {};
  camadas.forEach((c) => {
    const peca = selectedPecas[c];
    imagens[c] = useImage(peca?.url);
  });

  // Ajuste da imagem no stage
  const fitImage = (img, stageWidth, stageHeight) => {
    if (!img) return { x: 0, y: 0, width: 0, height: 0 };
    const scale = Math.min(stageWidth / img.width, stageHeight / img.height, 1);
    return {
      x: (stageWidth - img.width * scale) / 2,
      y: (stageHeight - img.height * scale) / 2,
      width: img.width * scale,
      height: img.height * scale,
    };
  };

  const getUserPecaQuantidade = (pecaId) => {
    const rec = (userPecas || []).find(
      (u) => String(u.peca_id) === String(pecaId)
    );
    return rec ? Number(rec.quantidade) : 0;
  };

  // Criar evento completo (sem perder nenhuma lógica)
  const criarEvento = async () => {
    if (!stageRef.current || !user || !eventCodePrefix || !name) {
      alert("Preencha todos os campos e esteja logado.");
      return;
    }
    if (!selectedPecas.AURA || !selectedPecas.BASE || !selectedPecas.ICONE) {
      alert("Você precisa selecionar pelo menos AURA, BASE e ICONE.");
      return;
    }

    setLoading(true);

    try {
      // Verifica peças disponíveis
      for (const c of camadas) {
        const peca = selectedPecas[c];
        if (!peca) continue;
        if (getUserPecaQuantidade(peca.id) <= 0) {
          alert(`Você não possui unidade suficiente da peça "${peca.nome}".`);
          setLoading(false);
          return;
        }
      }

      const design_config = {};
      camadas.forEach((c) => {
        if (selectedPecas[c]) design_config[c] = selectedPecas[c].id;
      });

      // Verifica duplicidade de design
      const { data: existingEvents } = await supabase
        .from("events")
        .select("id, design_config");

      const existeEventoComMesmoDesign = existingEvents?.some((ev) => {
        try {
          const conf =
            typeof ev.design_config === "string"
              ? JSON.parse(ev.design_config)
              : ev.design_config;
          return camadas.every((c) => {
            const desired = design_config[c];
            const existing = conf?.[c];
            if (desired === undefined && existing === undefined) return true;
            return desired === existing;
          });
        } catch {
          return false;
        }
      });

      if (existeEventoComMesmoDesign) {
        alert("❌ Já existe um evento com esse mesmo design_config.");
        setLoading(false);
        return;
      }

      // Verifica prefixo duplicado
      const { data: existingPrefix } = await supabase
        .from("events")
        .select("id")
        .eq("event_code_prefix", eventCodePrefix)
        .maybeSingle();

      if (existingPrefix) {
        alert("❌ Já existe um evento com esse código.");
        setLoading(false);
        return;
      }

      // Gera imagem
      const dataUrl = stageRef.current.toDataURL({
        mimeType: "image/png",
        pixelRatio: 2,
      });
      setChaveCriada({ url: dataUrl });

      // Upload
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `${eventCodePrefix}.png`;
      const { error: uploadError } = await supabase.storage
        .from("chaves")
        .upload(fileName, blob, { upsert: true, contentType: "image/png" });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("chaves")
        .getPublicUrl(fileName);

      // Cria evento
      const { data: newEvent, error: eventError } = await supabase
        .from("events")
        .insert({
          name,
          event_code_prefix: eventCodePrefix,
          max_chaves: maxChaves,
          design_url: publicUrlData.publicUrl,
          design_config,
          creator_id: user.id,
          key_count: 0,
        })
        .select()
        .single();
      if (eventError) throw eventError;

      // Cria chave inicial
      const serialNumber = `${eventCodePrefix}#01`;
      const { error: chaveError } = await supabase.from("chaves").insert({
        event_id: newEvent.id,
        owner_id: user.id,
        serial_number: serialNumber,
        criado_por: user.id,
        is_admin: true,
        is_transferable: true,
      });
      if (chaveError) throw chaveError;

      // Módulos padrão
      const defaultModules = [
        { event_id: newEvent.id, module_name: "FeedHeader", module_order: 1, active: true },
        { event_id: newEvent.id, module_name: "FeedChat", module_order: 2, active: true },
        { event_id: newEvent.id, module_name: "Favoritos", module_order: 3, active: true },
        { event_id: newEvent.id, module_name: "SuggestedProfiles", module_order: 4, active: true },
      ];
      const { error: modulesError } = await supabase
        .from("event_modules")
        .insert(defaultModules);
      if (modulesError) throw modulesError;

      // Incrementa contador
      await supabase.rpc("increment_key_count", { event_id: newEvent.id });

      // Decrementa peças do usuário
      for (const c of camadas) {
        const peca = selectedPecas[c];
        if (!peca) continue;
        await supabase.rpc("decrement_user_peca", {
          p_user_id: user.id,
          p_peca_id: peca.id,
        });
      }

      await fetchUserPecas();

      alert("✅ Evento, chave e módulos criados com sucesso!");
      setName("");
      setEventCodePrefix("");
      setMaxChaves(1);
      setSelectedPecas({
        EFEITO: null,
        AURA: null,
        BASE: null,
        ICONE: null,
        DETALHE: null,
      });
    } catch (error) {
      console.error(error);
      alert(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col mb-10 items-center w-full min-h-screen relative overflow-hidden transition-colors duration-500 ${
        dark
          ? "bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100"
          : "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 text-gray-900"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-lg backdrop-blur-xl border rounded-2xl p-6 shadow-lg ${
          dark ? "bg-white/5 border-white/10" : "bg-white/70 border-gray-300"
        }`}
      >
        {/* Inputs */}
        <div className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            placeholder="Nome do Evento"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`px-0 placeholder:text-center py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm transition ${
              dark
                ? "bg-zinc-800/70 border-zinc-700 focus:ring-indigo-500 placeholder-zinc-400"
                : "bg-white border-gray-300 focus:ring-indigo-400 placeholder-gray-500"
            }`}
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Código do Evento"
              value={eventCodePrefix}
              onChange={(e) => setEventCodePrefix(e.target.value)}
              className={`flex-1 placeholder:text-center py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm transition ${
                dark
                  ? "bg-zinc-800/70 border-zinc-700 focus:ring-indigo-500 placeholder-zinc-400"
                  : "bg-white border-gray-300 focus:ring-indigo-400 placeholder-gray-500"
              }`}
            />
            <input
              type="number"
              placeholder="Qtd. Chaves"
              value={maxChaves}
              onChange={(e) => setMaxChaves(Number(e.target.value))}
              min={1}
              className={`w-28 placeholder:text-center py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm transition ${
                dark
                  ? "bg-zinc-800/70 border-zinc-700 focus:ring-indigo-500 placeholder-zinc-400"
                  : "bg-white border-gray-300 focus:ring-indigo-400 placeholder-gray-500"
              }`}
            />
          </div>
        </div>

        {/* Camadas */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {camadas.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedLayer(c)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                selectedLayer === c
                  ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-md"
                  : dark
                  ? "bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Lista de peças */}
        <div className="flex overflow-x-auto gap-3 mb-6 py-2">
          {(pecas || [])
            .filter((p) => p.camada === selectedLayer)
            .map((peca) => {
              const rec = userPecas.find(
                (u) => String(u.peca_id) === String(peca.id)
              );
              const possui = rec && rec.quantidade > 0;
              return (
                <div key={peca.id} className="relative flex-shrink-0">
                  <img
                    src={peca.url}
                    alt={peca.nome}
                    onClick={() =>
                      possui &&
                      setSelectedPecas((prev) => ({
                        ...prev,
                        [selectedLayer]: peca,
                      }))
                    }
                    className={`w-16 h-16 rounded-xl object-cover border-2 transition-all ${
                      selectedPecas[selectedLayer]?.id === peca.id
                        ? "border-gradient-to-r from-indigo-500 to-fuchsia-500 scale-105"
                        : dark
                        ? "border-zinc-700"
                        : "border-gray-300"
                    } ${possui ? "opacity-100" : "opacity-40 cursor-not-allowed"}`}
                    title={possui ? `${rec.quantidade} disponíveis` : "❌ Não possui"}
                  />
                  {possui && (
                    <span
                      className={`absolute bottom-0 right-1 text-[10px] px-1 rounded ${
                        dark ? "bg-zinc-900/80 text-gray-200" : "bg-white/80 text-gray-800"
                      }`}
                    >
                      x{rec.quantidade}
                    </span>
                  )}
                </div>
              );
            })}
        </div>

        {/* Preview */}
        <div className="flex justify-center mb-6 scale-50 origin-center">
          <div className="transform scale-[2]">
            <Stage
              ref={stageRef}
              width={stageSize}
              height={stageSize}
              className={`rounded-xl border ${
                dark ? "border-zinc-700 bg-zinc-900/50" : "border-gray-300 bg-gray-100"
              }`}
            >
              <Layer>
                {camadas.map((c) => {
                  const img = imagens[c];
                  return img ? (
                    <KonvaImage
                      key={c}
                      image={img}
                      {...fitImage(img, stageSize, stageSize)}
                    />
                  ) : null;
                })}
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Botão criar */}
        <button
          onClick={criarEvento}
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 shadow-lg transition-all disabled:opacity-50 text-white"
        >
          {loading ? "Criando..." : "🚀 Criar Chave"}
        </button>
      </motion.div>

      {/* Partículas e preview */}
      {chaveCriada && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
        >
          {engineLoaded && (
            <Particles
              id="particles-chave"
              options={{
                background: { color: "transparent" },
                particles: {
                  color: { value: "#ffcc00" },
                  move: { enable: true, speed: 1.5 },
                  number: { value: 150 },
                  opacity: { value: 0.6 },
                  size: { value: { min: 2, max: 4 } },
                },
              }}
              className="absolute inset-0 z-0"
            />
          )}
          <motion.img
            src={chaveCriada.url}
            alt="Chave Criada"
            className="w-64 h-64 z-10 cursor-pointer drop-shadow-xl"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{ duration: 1 }}
            onClick={() => setChaveCriada(null)}
          />
        </motion.div>
      )}
    </div>
  );
}
