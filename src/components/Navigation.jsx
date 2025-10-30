import { Link, useLocation } from 'react-router-dom'
import { Home, Plus, User } from 'lucide-react'
import { URLS } from '@/constants'

const Navigation = () => {
  const location = useLocation()

  const navItems = [
    { icon: Home, href: URLS.dashboard, label: 'Inicio' },
    { icon: Plus, href: URLS.NovaChave, label: 'Novo Evento', isCenter: true },
    { icon: User, href: URLS.profile, label: 'Perfil' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card dark:bg-card-dark shadow-inner z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          const baseClasses =
            'flex flex-col items-center justify-center text-xs transition-colors duration-200'
          const activeClasses = isActive
            ? 'text-blue-500 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-300'
          const centerClasses = item.isCenter
            ? 'bg-blue-500 dark:bg-blue-600 text-white rounded-full p-4 -mt-6 shadow-lg'
            : ''

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`${baseClasses} ${activeClasses} ${centerClasses}`}
            >
              <Icon className="w-6 h-6" />
              {!item.isCenter && <span>{item.label}</span>}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default Navigation
