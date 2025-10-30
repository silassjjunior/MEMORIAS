// src/lib/pecasService.js
import { supabase } from "@/lib/supabase";

/** 🔹 Buscar todas as peças disponíveis (catálogo global) */
export async function getAllPecas() {
  const { data, error } = await supabase
    .from("pecas")
    .select("*")
    .order("camada", { ascending: true });

  if (error) throw error;
  return data;
}

/** 🔹 Buscar peças por camada (ex: 'BASE', 'AURA', 'ICONE' etc.) */
export async function getPecasByCamada(camada) {
  const { data, error } = await supabase
    .from("pecas")
    .select("*")
    .eq("camada", camada)
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return data;
}

/** 🔹 Buscar peças do usuário (inventário pessoal) */
export async function getUserPecas(userId) {
  const { data, error } = await supabase
    .from("user_pecas")
    .select("peca_id, quantidade, pecas(*)")
    .eq("user_id", userId);

  if (error) throw error;
  return data.map((p) => ({
    ...p.pecas,
    quantidade: p.quantidade,
  }));
}

/** 🔹 Adicionar uma peça ao usuário */
export async function addUserPeca(userId, pecaId, quantidade = 1, origem = "sistema") {
  const { data, error } = await supabase
    .from("user_pecas")
    .upsert([{ user_id: userId, peca_id: pecaId, quantidade, origem }]);

  if (error) throw error;
  return data;
}
