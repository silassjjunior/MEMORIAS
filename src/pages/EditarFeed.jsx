// src/pages/EditarFeed.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Importa todos os módulos via index.js
import { moduleComponents } from "@/modules";

const EditarFeed = () => {
  const navigate = useNavigate();
  const { chaveId } = useParams();

  const [eventData, setEventData] = useState({ name: "", design_url: "" });
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- Buscar chave, validar admin e buscar evento
  useEffect(() => {
    if (!chaveId) return;

    const fetchData = async () => {
      try {
        const { data: chaveData, error: chaveError } = await supabase
          .from("chaves")
          .select("event_id, is_admin")
          .eq("id", chaveId)
          .single();

        if (chaveError || !chaveData?.event_id) {
          alert("Chave inválida ou evento não encontrado.");
          navigate(-1);
          return;
        }

        if (!chaveData.is_admin) {
          alert("Você não tem permissão para editar este feed.");
          navigate(-1);
          return;
        }

        setEventId(chaveData.event_id);
        setIsAdmin(true);

        const { data: eventResp, error: eventError } = await supabase
          .from("events")
          .select("name, design_url")
          .eq("id", chaveData.event_id)
          .single();
        if (eventError) throw eventError;
        setEventData(eventResp || { name: "", design_url: "" });

        const { data: modulesResp, error: modulesError } = await supabase
          .from("event_modules")
          .select("*")
          .eq("event_id", chaveData.event_id)
          .order("module_order", { ascending: true });
        if (modulesError) throw modulesError;
        setModules(modulesResp || []);
      } catch (err) {
        console.error("Erro ao carregar dados do feed:", err);
        alert("Erro ao carregar dados do feed. Veja o console.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chaveId, navigate]);

  // --- Toggle módulo ativo
  const toggleModuleActive = (moduleId) => {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, active: !m.active } : m))
    );
  };

  // --- Drag & Drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(modules);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    const updated = items.map((m, idx) => ({ ...m, module_order: idx + 1 }));
    setModules(updated);
  };

  // --- Salvar alterações
  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: eventError } = await supabase
        .from("events")
        .update({ name: eventData.name, design_url: eventData.design_url })
        .eq("id", eventId);
      if (eventError) throw eventError;

      for (const module of modules) {
        const { error: moduleError } = await supabase
          .from("event_modules")
          .update({ active: module.active, module_order: module.module_order })
          .eq("id", module.id);
        if (moduleError) throw moduleError;
      }

      alert("Alterações salvas com sucesso!");
      navigate(-1);
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
      alert("Erro ao salvar alterações. Veja o console.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="bg-card dark:bg-card-dark shadow-sm p-3 sticky top-0 z-20 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-foreground dark:text-foreground"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">Editar Evento</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4">
        {/* Dados do Evento */}
        <div className="flex flex-col gap-3 bg-card dark:bg-card-dark p-4 rounded-lg shadow">
          <label className="font-semibold">Nome do Evento</label>
          <input
            type="text"
            className="p-2 rounded border w-full"
            value={eventData.name}
            onChange={(e) =>
              setEventData({ ...eventData, name: e.target.value })
            }
          />
          <label className="font-semibold">Design URL / Imagem</label>
          <input
            type="text"
            className="p-2 rounded border w-full"
            value={eventData.design_url}
            onChange={(e) =>
              setEventData({ ...eventData, design_url: e.target.value })
            }
          />
        </div>

        {/* Módulos com Drag & Drop e Miniaturas */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="modules">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-col gap-3 bg-card dark:bg-card-dark p-4 rounded-lg shadow"
              >
                <h2 className="font-bold text-lg">Módulos do Evento</h2>
                {modules.map((module, index) => {
                  const ModuleComponent = moduleComponents[module.module_name];
                  return (
                    <Draggable
                      key={module.id}
                      draggableId={module.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center justify-between p-2 rounded gap-3 ${
                            snapshot.isDragging
                              ? "bg-primary/20"
                              : "bg-background dark:bg-background-dark"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={module.active}
                              onChange={() => toggleModuleActive(module.id)}
                            />
                            <span>{module.module_name}</span>
                          </div>

                          {/* Miniatura */}
                          {ModuleComponent && (
                            <div className="w-24 h-16 border rounded overflow-hidden">
                              <ModuleComponent eventId={eventId} preview />
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Botão Salvar */}
        <button
          onClick={handleSave}
          disabled={saving || !isAdmin}
          className="flex items-center gap-2 bg-primary dark:bg-primary-dark text-white px-4 py-2 rounded hover:bg-primary-hover dark:hover:bg-primary-hover-dark transition"
        >
          <Save size={16} /> {saving ? "Salvando..." : "Salvar Alterações"}
        </button>

        {/* Prévia do Feed */}
        {eventId && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow flex flex-col gap-2">
            <h2 className="font-bold mb-2">Prévia do Feed</h2>
            {modules
              .filter((m) => m.active)
              .sort((a, b) => a.module_order - b.module_order)
              .map((module) => {
                const ModuleComponent = moduleComponents[module.module_name];
                return (
                  ModuleComponent && (
                    <div
                      key={module.id}
                      className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow flex flex-col gap-2 border border-gray-300 dark:border-gray-600"
                    >
                      <span className="font-semibold text-sm text-gray-600 dark:text-gray-300">
                        {module.module_name}
                      </span>
                      <ModuleComponent eventId={eventId} />
                    </div>
                  )
                );
              })}
          </div>
        )}
      </main>
    </div>
  );
};

export default EditarFeed;
