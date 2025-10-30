import React, { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth()
  const [theme, setTheme] = useState("dark") // padrão dark

  // 🔹 Buscar tema salvo no banco ao carregar o app
  useEffect(() => {
    const loadTheme = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from("Users")
        .select("theme_preference")
        .eq("id", user.id)
        .single()

      if (error) {
        console.warn("Não foi possível carregar tema:", error)
        return
      }

      if (data?.theme_preference) {
        setTheme(data.theme_preference)
        document.documentElement.classList.toggle(
          "dark",
          data.theme_preference === "dark"
        )
      }
    }

    loadTheme()
  }, [user])

  // 🔹 Alternar tema e salvar no banco
  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")

    if (user) {
      try {
        await supabase
          .from("Users")
          .update({ theme_preference: newTheme })
          .eq("id", user.id)
      } catch (err) {
        console.error("Erro ao salvar tema no banco:", err)
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ✅ Export do hook personalizado
export const useTheme = () => useContext(ThemeContext)
