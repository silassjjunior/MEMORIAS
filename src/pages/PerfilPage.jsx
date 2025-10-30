import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { useChave } from "@/contexts/ChaveContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useNavigate } from "react-router-dom"
import { Camera, Moon, Sun, Plus, ShoppingBag } from "lucide-react"

const PerfilPage = () => {
  const { user } = useAuth()
  const { setChaveSelecionada } = useChave()
  const { theme, toggleTheme } = useTheme() // 🌙 vindo do contexto global
  const [profile, setProfile] = useState(null)
  const [events, setEvents] = useState([])
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  // 🔹 Buscar perfil + eventos
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("Users")
          .select("username, avatar_url, email")
          .eq("id", user.id)
          .single()
        if (profileError) throw profileError

        setProfile(profileData)

        const { data: chaves, error: chaveError } = await supabase
          .from("chaves")
          .select("id, event_id")
          .eq("owner_id", user.id)
        if (chaveError) throw chaveError
        if (!chaves || chaves.length === 0) return

        const eventIds = chaves.map((c) => c.event_id)
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("id, name, design_url")
          .in("id", eventIds)
        if (eventsError) throw eventsError

        const eventsWithKeys = eventsData.map((event) => {
          const chave = chaves.find((c) => c.event_id === event.id)
          return { ...event, chave_id: chave?.id }
        })

        setEvents(eventsWithKeys)
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
      }
    }

    fetchData()
  }, [user])

  // 🔹 Upload de avatar
  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      if (!file) return

      // remove o antigo avatar se existir
      if (profile?.avatar_url) {
        const parts = profile.avatar_url.split("/profiles_bucket/")
        if (parts.length > 1) {
          await supabase.storage.from("profiles_bucket").remove([parts[1]])
        }
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("profiles_bucket")
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from("profiles_bucket")
        .getPublicUrl(filePath)
      const publicUrl = publicUrlData?.publicUrl

      const { error: updateError } = await supabase
        .from("Users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id)
      if (updateError) throw updateError

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }))
    } catch (error) {
      console.error("Erro ao fazer upload do avatar:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleNavigate = (chaveId) => {
    setChaveSelecionada(chaveId)
    navigate("/memories")
  }

  const handleNovoEvento = () => navigate("/novoevento")
  const handleIrLoja = () => navigate("/lojapecaspage")

  return (
    <div
      className={`mb-10 min-h-screen flex flex-col items-center px-4 py-10 transition-colors duration-300 ${
        theme === "dark" ? "bg-zinc-950 text-zinc-50" : "bg-zinc-100 text-zinc-900"
      }`}
    >
      {/* 🌙 Botão de tema */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* 🧿 Avatar */}
      <div className="relative mt-6">
        <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg hover:scale-105 transition-transform duration-300">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-300 text-zinc-600">
              Avatar
            </div>
          )}
        </div>
        <label
          htmlFor="avatar-upload"
          className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-500 transition"
        >
          <Camera className="text-white w-4 h-4" />
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* 🧠 Nome */}
      <h2 className="mt-4 text-2xl font-semibold tracking-wide">
        {profile?.username || "Usuário"}
      </h2>
      <p className="text-sm text-zinc-500 mt-1">@{profile?.email || "Usuário"}</p>

      {/* 🧭 Ações */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button
          onClick={handleNovoEvento}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition"
        >
          <Plus size={18} />
          <span>Novo Evento</span>
        </button>
        <button
          onClick={handleIrLoja}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
        >
          <ShoppingBag size={18} />
          <span>Loja de Peças</span>
        </button>
      </div>

      {/* 🏆 Seção de Chaves */}
      <div className="mt-10 w-full max-w-2xl">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Suas Chaves / Troféus
        </h3>

        {events.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 ">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => handleNavigate(event.chave_id)}
                className="overflow-hidden rounded-lg border border-transparent bg-transparent hover:scale-105 hover:shadow-lg transition-all"
              >
                <img
                  src={event.design_url || "/img/memoria-placeholder.jpg"}
                  alt={event.name}
                  className="w-full h-24 object-cover opacity-900 hover:opacity-100"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-zinc-500 mt-4">
            Nenhum troféu ainda 😔
          </p>
        )}
      </div>
    </div>
  )
}

export default PerfilPage
