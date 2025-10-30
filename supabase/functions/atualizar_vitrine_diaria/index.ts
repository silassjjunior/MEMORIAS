// supabase/functions/atualizar_vitrine_diaria/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1️⃣ Definir camadas e quantidade por camada
    const camadas = ["EFEITO", "AURA", "BASE", "ICONE", "DETALHE"];
    const qtdPorCamada = 3;
    const vitrineDoDia: Array<{ peca_id: string; camada: string }> = [];

    // 2️⃣ Buscar todas as peças disponíveis
    const { data: pecas, error: pecasError } = await supabase
      .from("pecas")
      .select("id, camada");

    if (pecasError || !pecas?.length) {
      throw new Error("Nenhuma peça encontrada");
    }

    // 3️⃣ Selecionar aleatoriamente peças por camada
    for (const camada of camadas) {
      const pecasDaCamada = pecas.filter(p => p.camada === camada);
      if (pecasDaCamada.length === 0) continue;

      const selecionadas = new Set<number>();
      while (selecionadas.size < Math.min(qtdPorCamada, pecasDaCamada.length)) {
        const idx = Math.floor(Math.random() * pecasDaCamada.length);
        selecionadas.add(idx);
      }

      selecionadas.forEach(idx => {
        vitrineDoDia.push({
          peca_id: pecasDaCamada[idx].id,
          camada,
        });
      });
    }

    if (vitrineDoDia.length === 0) {
      throw new Error("Nenhuma peça disponível para a vitrine do dia");
    }

    // 4️⃣ Limpar vitrine antiga
    await supabase.from("pecas_do_dia").delete().not("id", "is", null);

    // 5️⃣ Inserir novas peças do dia
    const { error: insertError } = await supabase
      .from("pecas_do_dia")
      .insert(
        vitrineDoDia.map(p => ({
          peca_id: p.peca_id,
          camada: p.camada,
          data: new Date().toISOString(),
        }))
      );

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Vitrine diária atualizada com sucesso",
        pecasDoDia: vitrineDoDia,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    console.error("Erro na função atualizar_vitrine_diaria:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
