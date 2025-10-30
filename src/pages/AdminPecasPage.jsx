// src/pages/AdminPecasPage.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPecasPage() {
  const [colecoes, setColecoes] = useState([]);
  const [pecas, setPecas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [filtro, setFiltro] = useState("");

  // Formulário de peça
  const [nomePeca, setNomePeca] = useState("");
  const [codigoPeca, setCodigoPeca] = useState("");
  const [raridade, setRaridade] = useState("comum");
  const [descricao, setDescricao] = useState("");
  const [camada, setCamada] = useState("BASE");
  const [colecaoSelecionada, setColecaoSelecionada] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [quantidadeMaxima, setQuantidadeMaxima] = useState(100);

  // Formulário de coleção
  const [novaColecao, setNovaColecao] = useState("");

  const fetchDados = async () => {
    try {
      const { data: colecoesData, error: colecoesError } = await supabase
        .from("colecoes")
        .select("*");
      if (colecoesError) throw colecoesError;
      setColecoes(colecoesData || []);

      const { data: pecasData, error: pecasError } = await supabase
        .from("pecas")
        .select("*");
      if (pecasError) throw pecasError;
      setPecas(pecasData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error.message);
      alert("Erro ao carregar dados: " + error.message);
    }
  };

  useEffect(() => {
    fetchDados();
  }, []);

  const criarColecao = async () => {
    if (!novaColecao) return alert("Digite o nome da coleção");
    try {
      const { data: newColecao, error } = await supabase
        .from("colecoes")
        .insert({ nome: novaColecao })
        .select()
        .single();
      if (error) throw error;
      setColecoes([...colecoes, newColecao]);
      setNovaColecao("");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar coleção: " + error.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setArquivo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const uploadPeca = async () => {
    if (!arquivo || !nomePeca || !codigoPeca || !colecaoSelecionada) {
      return alert("Preencha todos os campos e selecione um arquivo");
    }

    setLoading(true);

    try {
      const fileExt = arquivo.name.split(".").pop();
      const fileName = `${codigoPeca}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("pecas")
        .upload(fileName, arquivo, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("pecas")
        .getPublicUrl(fileName);
      const imageUrl = publicUrlData.publicUrl;

      const { data: newPeca, error: insertError } = await supabase
        .from("pecas")
        .insert([
          {
            codigo: codigoPeca,
            nome: nomePeca,
            colecao: colecaoSelecionada,
            raridade,
            camada,
            descricao,
            url: imageUrl,
            quantidade,
            quantidade_maxima: quantidadeMaxima,
          },
        ])
        .select()
        .single();
      if (insertError) throw insertError;

      setPecas([...pecas, newPeca]);
      setNomePeca("");
      setCodigoPeca("");
      setRaridade("comum");
      setDescricao("");
      setCamada("BASE");
      setColecaoSelecionada("");
      setArquivo(null);
      setPreviewUrl(null);
      setQuantidade(1);
      setQuantidadeMaxima(100);

      alert("✅ Peça criada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deletarPeca = async (codigo) => {
    if (!window.confirm("Deseja realmente deletar esta peça?")) return;
    try {
      const { error } = await supabase.from("pecas").delete().eq("codigo", codigo);
      if (error) throw error;
      setPecas(pecas.filter((p) => p.codigo !== codigo));
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar: " + error.message);
    }
  };

  const atualizarQuantidade = async (codigo, novaQtd) => {
    try {
      const { data, error } = await supabase
        .from("pecas")
        .update({ quantidade: novaQtd })
        .eq("codigo", codigo)
        .select()
        .single();
      if (error) throw error;
      setPecas(pecas.map((p) => (p.codigo === codigo ? data : p)));
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar quantidade: " + error.message);
    }
  };

  const atualizarQuantidadeMaxima = async (codigo, novaQtdMax) => {
    try {
      const { data, error } = await supabase
        .from("pecas")
        .update({ quantidade_maxima: novaQtdMax })
        .eq("codigo", codigo)
        .select()
        .single();
      if (error) throw error;
      setPecas(pecas.map((p) => (p.codigo === codigo ? data : p)));
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar quantidade máxima: " + error.message);
    }
  };

  const pecasFiltradas = pecas.filter(
    (p) =>
      p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      p.colecao.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-900 text-gray-100 min-h-screen mb-10">
      <h1 className="text-2xl font-bold mb-4">Administração de Peças</h1>

      {/* Filtro */}
      <input
        type="text"
        placeholder="Buscar por peça ou coleção..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mb-4 p-2 rounded bg-gray-800 text-gray-100 border border-gray-700 w-full"
      />

      {/* Criar coleção */}
      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800">
        <h2 className="font-semibold mb-2">Nova Coleção</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nome da coleção"
            value={novaColecao}
            onChange={(e) => setNovaColecao(e.target.value)}
            className="border rounded p-2 flex-1 bg-gray-700 text-gray-100 border-gray-600"
          />
          <button
            onClick={criarColecao}
            className="bg-blue-600 text-white px-4 rounded hover:bg-blue-500"
          >
            Criar
          </button>
        </div>
      </div>

      {/* Criar peça */}
      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800">
        <h2 className="font-semibold mb-2">Nova Peça</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          <input
            placeholder="Nome"
            value={nomePeca}
            onChange={(e) => setNomePeca(e.target.value)}
            className="border rounded p-2 bg-gray-700 border-gray-600"
          />
          <input
            placeholder="Código"
            value={codigoPeca}
            onChange={(e) => setCodigoPeca(e.target.value)}
            className="border rounded p-2 bg-gray-700 border-gray-600"
          />
          <select
            value={colecaoSelecionada}
            onChange={(e) => setColecaoSelecionada(e.target.value)}
            className="border rounded p-2 bg-gray-700 border-gray-600"
          >
            <option value="">Selecione a coleção</option>
            {colecoes.map((c) => (
              <option key={c.nome} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
          <select
            value={camada}
            onChange={(e) => setCamada(e.target.value)}
            className="border rounded p-2 bg-gray-700 border-gray-600"
          >
            <option value="EFEITO">EFEITO</option>
            <option value="AURA">AURA</option>
            <option value="BASE">BASE</option>
            <option value="ICONE">ICONE</option>
            <option value="DETALHE">DETALHE</option>
          </select>
          <select
            value={raridade}
            onChange={(e) => setRaridade(e.target.value)}
            className="border rounded p-2 bg-gray-700 border-gray-600"
          >
            <option value="comum">Comum</option>
            <option value="raro">Raro</option>
            <option value="epico">Épico</option>
            <option value="lendario">Lendário</option>
          </select>
          <input
            type="number"
            placeholder="Quantidade inicial"
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            className="border rounded p-2 bg-gray-700 border-gray-600"
            min={0}
          />
          <input
            type="number"
            placeholder="Quantidade máxima"
            value={quantidadeMaxima}
            onChange={(e) => setQuantidadeMaxima(Number(e.target.value))}
            className="border rounded p-2 bg-gray-700 border-gray-600"
            min={1}
          />
          <input
            placeholder="Descrição (opcional)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="border rounded p-2 col-span-2 bg-gray-700 border-gray-600"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="col-span-2 bg-gray-700 text-gray-100"
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="col-span-2 w-32 h-32 object-cover border mt-2"
            />
          )}
        </div>
        <button
          onClick={uploadPeca}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded mt-2 hover:bg-green-500"
        >
          {loading ? "Enviando..." : "Criar Peça"}
        </button>
      </div>

      {/* Lista de peças */}
      <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
        <h2 className="font-semibold mb-2">Peças Cadastradas</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-gray-100">
            <thead>
              <tr className="bg-gray-700">
                <th className="border px-2 py-1">Código</th>
                <th className="border px-2 py-1">Nome</th>
                <th className="border px-2 py-1">Coleção</th>
                <th className="border px-2 py-1">Camada</th>
                <th className="border px-2 py-1">Raridade</th>
                <th className="border px-2 py-1">Qtd</th>
                <th className="border px-2 py-1">Qtd Máx</th>
                <th className="border px-2 py-1">Imagem</th>
                <th className="border px-2 py-1">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pecasFiltradas.map((p) => (
                <tr key={p.codigo} className="hover:bg-gray-700">
                  <td className="border px-2 py-1">{p.codigo}</td>
                  <td className="border px-2 py-1">{p.nome}</td>
                  <td className="border px-2 py-1">{p.colecao}</td>
                  <td className="border px-2 py-1">{p.camada}</td>
                  <td className="border px-2 py-1 capitalize">{p.raridade}</td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={p.quantidade || 0}
                      onChange={(e) =>
                        atualizarQuantidade(p.codigo, Number(e.target.value))
                      }
                      className="bg-gray-700 border border-gray-600 text-white rounded p-1 w-16"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={p.quantidade_maxima || 100}
                      onChange={(e) =>
                        atualizarQuantidadeMaxima(p.codigo, Number(e.target.value))
                      }
                      className="bg-gray-700 border border-gray-600 text-white rounded p-1 w-16"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    {p.url && (
                      <img
                        src={p.url}
                        alt={p.nome}
                        className="w-16 h-16 object-cover"
                      />
                    )}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => deletarPeca(p.codigo)}
                      className="bg-red-600 px-2 py-1 rounded hover:bg-red-500"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
              {pecasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-2">
                    Nenhuma peça encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
