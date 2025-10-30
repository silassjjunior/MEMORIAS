import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { usePecas } from "@/contexts/PecasContext";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion } from "framer-motion";

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

export default function EditorDeChave() {
  const stageRef = useRef(null);
  const { user } = useAuth();
  const { pecas } = usePecas();

  // Estados
  const [name, setName] = useState("");
  const [eventCodePrefix, setEventCodePrefix] = useState("");
  const [maxChaves, setMaxChaves] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userPecas, setUserPecas] = useState([]);
  const camadas = ["EFEITO", "AURA", "BASE", "ICONE", "DETALHE"];
  const [selectedPecas, setSelectedPecas] = useState({
    EFEITO: null,
    AURA: null,
    BASE: null,
    ICONE: null,
    DETALHE: null,
  });

  const [selectedLayer, setSelectedLayer] = useState("BASE"); // camada selecionada

  // Partículas
  const [engineLoaded, setEngineLoaded] = useState(false);
  const [chaveCriada, setChaveCriada] = useState(null);

  useEffect(() => {
    initParticlesEngine(async (engine) => await loadSlim(engine)).then(() =>
      setEngineLoaded(true)
    );
  }, []);

  // Carrega imagens no stage
  const imagens = {};
  camadas.forEach((c) => {
    const peca = selectedPecas[c];
    imagens[c] = useImage(peca?.url);
  });

  // Responsividade do Stage
  const [stageSize, setStageSize] = useState(350);
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      const size = isMobile ? Math.min(window.innerWidth - 40, 320) : Math.min(window.innerWidth * 0.9, 500);
      setStageSize(size);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user_pecas
  const fetchUserPecas = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_pecas")
      .select("peca_id, quantidade")
      .eq("user_id", user.id);
    if (error) {
      console.error("Erro ao buscar user_pecas:", error);
      setUserPecas([]);
    } else {
      setUserPecas(data || []);
    }
  };
  useEffect(() => {
    fetchUserPecas();
  }, [user]);

  // Ajuste de imagem no stage
  const fitImage = (img, stageWidth, stageHeight) => {
    if (!img) return { x: 0, y: 0, width: 0, height: 0 };
    const scale = Math.min(stageWidth / img.width, stageHeight / img.height, 1);
    const width = img.width * scale;
    const height = img.height * scale;
    return { x: (stageWidth - width) / 2, y: (stageHeight - height) / 2, width, height };
  };

  const getUserPecaQuantidade = (pecaId) => {
    const rec = (userPecas || []).find((u) => String(u.peca_id) === String(pecaId));
    return rec ? Number(rec.quantidade) : 0;
  };

  // Função criar evento
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
      // Verifica quantidade de peças
      for (const c of camadas) {
        const peca = selectedPecas[c];
        if (!peca) continue;
        if (getUserPecaQuantidade(peca.id) <= 0) {
          alert(`Você não possui unidade suficiente da peça "${peca.nome}".`);
          setLoading(false);
          return;
        }
      }

      // Gera dataURL da chave
      const dataUrl = stageRef.current.toDataURL({ mimeType: "image/png", pixelRatio: 2 });

      // Mostra animação de partículas
      setChaveCriada({ url: dataUrl });

      // Aqui mantém toda lógica de criação de evento, upload, chave e decremento
      const design_config = {};
      camadas.forEach((c) => {
        if (selectedPecas[c]) design_config[c] = selectedPecas[c].id;
      });

      // Verifica duplicidade
      const { data: existingEvents } = await supabase.from("events").select("id, design_config");
      const existeEventoComMesmoDesign = existingEvents?.some((ev) => {
        try {
          const conf = typeof ev.design_config === "string" ? JSON.parse(ev.design_config) : ev.design_config;
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

      // Prefixo duplicado
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

      // Upload da imagem
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `${eventCodePrefix}.png`;
      const { error: uploadError } = await supabase.storage
        .from("chaves")
        .upload(fileName, blob, { upsert: true, contentType: "image/png" });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("chaves").getPublicUrl(fileName);

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

      // Cria chave
      const serialNumber = `${eventCodePrefix}#01`;
      const { data: newChave, error: chaveError } = await supabase.from("chaves").insert({
        event_id: newEvent.id,
        owner_id: user.id,
        serial_number: serialNumber,
        criado_por: user.id,
        is_admin: true,
        is_transferable: true,
      }).select().single();
      if (chaveError) throw chaveError;

      // Cria módulos padrão
      const defaultModules = [
        { event_id: newEvent.id, module_name: "FeedHeader", module_order: 1, active: true },
        { event_id: newEvent.id, module_name: "FeedChat", module_order: 2, active: true },
        { event_id: newEvent.id, module_name: "Favoritos", module_order: 3, active: true },
        { event_id: newEvent.id, module_name: "SuggestedProfiles", module_order: 4, active: true },
      ];
      const { error: modulesError } = await supabase.from("event_modules").insert(defaultModules);
      if (modulesError) throw modulesError;

      // Incrementa key_count
      const { error: incError } = await supabase.rpc("increment_event_key_count", { event_id: newEvent.id });
      if (incError) console.error("Erro ao incrementar key_count:", incError);

      // Decrementa peças
      for (const c of camadas) {
        const peca = selectedPecas[c];
        if (!peca) continue;
        const { data: novaQtd, error: rpcErr } = await supabase
          .rpc("decrement_user_peca", { p_user_id: user.id, p_peca_id: peca.id });
        if (rpcErr) throw new Error(`Erro ao debitar a peça ${peca.nome}`);
        if (Number(novaQtd) === -1) throw new Error(`Sem estoque para a peça ${peca.nome}`);
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
    <div className="flex flex-col items-center w-full min-h-screen bg-zinc-950 text-zinc-100 px-4 py-6 mb-10">
      {/* Inputs */}
      <div className="w-full max-w-lg flex flex-col gap-3 mb-4">
        <input
          type="text"
          placeholder="Nome do Evento"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
        <input
          type="text"
          placeholder="Código do Evento (único)"
          value={eventCodePrefix}
          onChange={(e) => setEventCodePrefix(e.target.value)}
          className="input"
        />
        <input
          type="number"
          placeholder="Quantidade de Chaves"
          value={maxChaves}
          onChange={(e) => setMaxChaves(Number(e.target.value))}
          className="input"
          min={1}
        />
      </div>

      {/* Botões de camadas */}
      <div className="flex gap-2 mb-2 flex-wrap justify-center max-w-lg">
        {camadas.map((c) => (
          <button
            key={c}
            className={`px-3 py-1 rounded ${selectedLayer === c ? "bg-indigo-600" : "bg-zinc-800"}`}
            onClick={() => setSelectedLayer(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Lista horizontal de peças da camada selecionada */}
      <div className="flex overflow-x-auto gap-2 mb-4 w-full max-w-lg">
        {(pecas || [])
          .filter((p) => p.camada === selectedLayer)
          .map((peca) => {
            const rec = userPecas.find((u) => String(u.peca_id) === String(peca.id));
            const possui = rec && rec.quantidade > 0;
            return (
              <div key={peca.id} className="relative">
                <img
                  src={peca.url}
                  alt={peca.nome}
                  onClick={() => possui && setSelectedPecas((prev) => ({ ...prev, [selectedLayer]: peca }))}
                  className={`w-16 h-16 rounded-lg cursor-pointer border-2 ${
                    selectedPecas[selectedLayer]?.id === peca.id ? "border-indigo-500" : "border-zinc-700"
                  } ${possui ? "opacity-100" : "opacity-40 cursor-not-allowed"}`}
                  title={possui ? `${rec.quantidade} disponíveis` : "❌ Não possui"}
                />
                {possui && (
                  <span className="absolute bottom-0 right-1 text-[10px] bg-zinc-800 px-1 rounded text-gray-200">
                    x{rec.quantidade}
                  </span>
                )}
              </div>
            );
          })}
      </div>

      {/* Stage */}
      <Stage ref={stageRef} width={stageSize} height={stageSize} className="border border-zinc-700 rounded-lg mb-4">
        <Layer>
          {camadas.map((c) => {
            const img = imagens[c];
            return img ? <KonvaImage key={c} image={img} {...fitImage(img, stageSize, stageSize)} /> : null;
          })}
        </Layer>
      </Stage>

      {/* Botão criar */}
      <button
        onClick={criarEvento}
        className="bg-indigo-600 px-6 py-2 rounded-lg shadow hover:bg-indigo-500 transition mb-6 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Criando..." : "Criar Chave"}
      </button>

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
            className="w-64 h-64 z-10"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{ duration: 1 }}
            onClick={() => setChaveCriada(null)}
          />
        </motion.div>
      )}

      <footer className="w-full max-w-lg mt-8 text-center text-sm text-zinc-500">
        Feito com ❤️ para sua coleção
      </footer>
    </div>
  );
}
