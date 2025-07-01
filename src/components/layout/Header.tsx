import { Menu, Sun, Moon, Bell, User, LogOut, Wifi, Database, Globe, DollarSign } from 'lucide-react'
import { Button } from '../ui/Button'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()

  return (
    <header className="bg-yellow-50 dark:bg-dark-900 border-b border-yellow-200 dark:border-dark-700 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* System Status - Moved from Sidebar */}
          <div className="hidden md:flex items-center space-x-4 px-4 py-2 bg-yellow-100 dark:bg-dark-800 rounded-lg border border-yellow-300 dark:border-dark-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Système Opérationnel</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Database className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">DB</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">API</span>
              </div>
              <div className="flex items-center space-x-1">
                <Wifi className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">USSD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="relative"
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </motion.div>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </span>
          </Button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.email}
              </p>
              <div className="flex items-center justify-end space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Administrateur</span>
                <span>•</span>
                <span className="text-green-600 dark:text-green-400 font-medium">En ligne</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <User className="w-5 h-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={signOut}
                className="text-accent-600 hover:text-accent-700"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}