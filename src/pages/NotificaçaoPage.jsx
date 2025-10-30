import React from 'react'
import { 
  Search, 
  Bell, 
  Home, 
  Plus, 
  User, 
  Calendar, 
  Award 
} from 'lucide-react'

const NotificaçãoPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white p-3 flex items-center justify-between fixed top-0 left-0 right-0 z-10 shadow-sm">
        <h1 className="text-lg font-bold text-blue-600">MEMORIAS</h1>
        <div className="flex items-center space-x-4">
          <button className="relative">
            <Search className="h-6 w-6 text-gray-600" />
          </button>
          <button className="relative">
            <Bell className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
          </button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 flex items-center justify-center text-center px-4 pt-16 pb-20">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🚧 Em breve
          </h2>
          <p className="text-gray-600">
            A página <span className="font-semibold text-blue-600">Notificação</span> estará disponível em breve.
          </p>
        </div>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner flex justify-around items-center py-2">
        <button><Home className="h-7 w-7 text-gray-600" /></button>
        <button><Calendar className="h-7 w-7 text-gray-600" /></button>
        <button className="bg-blue-600 text-white p-3 rounded-full -mt-8 shadow-lg">
          <Plus className="h-6 w-6" />
        </button>
        <button><Award className="h-7 w-7 text-gray-600" /></button>
        <button><User className="h-7 w-7 text-gray-600" /></button>
      </nav>
    </div>
  )
}

export default NotificaçãoPage
