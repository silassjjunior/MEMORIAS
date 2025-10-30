import React, { useEffect, useState, useRef } from "react";
import { Share2, Edit3, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const FeedHeader = ({ eventId, event: eventProp, preview = false, isAdmin = false }) => {
  const [event, setEvent] = useState(eventProp || null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // --- Busca o evento se necessário
  useEffect(() => {
    const fetchEvent = async () => {
      if (preview || eventProp || !eventId) return;
      const { data, error } = await supabase
        .from("events")
        .select("id, name, design_url, event_date, cover_image_url, event_code_prefix")
        .eq("id", eventId)
        .single();

      if (error) console.error("Erro ao buscar evento:", error);
      else setEvent(data);
    };
    fetchEvent();
  }, [eventId, eventProp, preview]);

  // --- Compartilhar código
  const handleShare = () => {
    if (!event?.event_code_prefix) return;
    navigator.clipboard.writeText(event.event_code_prefix);
    alert(`Código do evento copiado: ${event.event_code_prefix}`);
  };

  // --- Upload do banner
  const handleFileChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${eventId}_${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("event_banners")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("event_banners").getPublicUrl(filePath);

      // Atualiza o evento no BD
      const { error: updateError } = await supabase
        .from("events")
        .update({ cover_image_url: publicUrl })
        .eq("id", eventId);

      if (updateError) throw updateError;

      setEvent((prev) => ({ ...prev, cover_image_url: publicUrl }));
      alert("Banner atualizado com sucesso!");
      setShowModal(false);
    } catch (err) {
      console.error("Erro ao enviar banner:", err);
      alert("Erro ao enviar banner. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  if (preview) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
        Cabeçalho do Evento
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Carregando cabeçalho...
      </div>
    );
  }

  const { name, design_url, event_date, cover_image_url } = event;

  return (
    <div
      className="relative rounded-lg shadow overflow-hidden transition-all duration-300"
      style={{
        backgroundImage: cover_image_url ? `url(${cover_image_url})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-black/40 dark:bg-black/50 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Info principal */}
        <div className="flex items-center gap-4">
          {design_url ? (
            <img
              src={design_url}
              alt="Logo do Evento"
              className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-400 rounded-lg flex items-center justify-center text-xs text-gray-200">
              Sem imagem
            </div>
          )}

          <div className="flex flex-col">
            <span className="font-bold text-lg md:text-xl text-white">{name}</span>
            {event_date && (
              <span className="text-sm text-gray-200">
                {new Date(event_date).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        </div>

        {/* Ações (apenas admin) */}
        {isAdmin && (
          <div className="flex items-center gap-2 mt-3 md:mt-0">
            <button
              onClick={handleShare}
              className="flex items-center gap-1 bg-primary dark:bg-primary-dark text-white px-3 py-1 rounded hover:bg-primary-hover dark:hover:bg-primary-hover-dark transition"
            >
              <Share2 size={16} /> Compartilhar
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 bg-secondary dark:bg-secondary-dark text-white px-3 py-1 rounded hover:bg-secondary-hover dark:hover:bg-secondary-hover-dark transition"
            >
              <Edit3 size={16} /> Editar Banner
            </button>
          </div>
        )}
      </div>

      {/* Modal de upload */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-96 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-300"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-semibold mb-4 text-center">Editar Banner</h2>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm mb-4"
              disabled={uploading}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {uploading ? "Enviando..." : "Selecionar e Enviar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedHeader;
