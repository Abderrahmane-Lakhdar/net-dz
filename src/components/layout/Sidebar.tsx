import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  Smartphone,
  DollarSign,
  Activity,
  Shield,
  Database,
  Brain,
  ChevronLeft,
  Pin,
  PinOff
} from 'lucide-react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

// Navigation items - structure simplifiée sans descriptions
const navigationItems = [
  { 
    name: 'Tableau de bord', 
    href: '/', 
    icon: LayoutDashboard
  },
  { 
    name: 'Transferts', 
    href: '/transfers', 
    icon: CreditCard
  },
  { 
    name: 'Clients', 
    href: '/clients', 
    icon: Users
  },
  { 
    name: 'Insights Avancés', 
    href: '/insights', 
    icon: Brain
  },
  { 
    name: 'SIMs & USSD', 
    href: '/sims', 
    icon: Smartphone
  },
  { 
    name: 'Pricing', 
    href: '/pricing', 
    icon: DollarSign
  },
  { 
    name: 'Base de Données', 
    href: '/database', 
    icon: Database
  },
  { 
    name: 'Santé du Système', 
    href: '/system-health', 
    icon: Activity
  },
  { 
    name: 'Sécurité', 
    href: '/security', 
    icon: Shield
  },
  { 
    name: 'Paramètres', 
    href: '/settings', 
    icon: Settings
  }
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isPinned, setIsPinned] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  // Charger la préférence utilisateur au montage
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed')
    const savedPinnedState = localStorage.getItem('sidebar-pinned')
    
    if (savedCollapsedState !== null) {
      setIsCollapsed(savedCollapsedState === 'true')
    }
    if (savedPinnedState !== null) {
      setIsPinned(savedPinnedState === 'true')
    }
  }, [])

  // Auto-hide functionality - seulement si pas épinglé
  useEffect(() => {
    if (!isPinned && !isHovered && !isOpen) {
      const timer = setTimeout(() => {
        setIsCollapsed(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isPinned, isHovered, isOpen])

  const togglePin = () => {
    const newPinnedState = !isPinned
    setIsPinned(newPinnedState)
    
    // Sauvegarder la préférence
    localStorage.setItem('sidebar-pinned', newPinnedState.toString())
    
    // Si on détache, réduire automatiquement
    if (!newPinnedState) {
      setIsCollapsed(true)
      localStorage.setItem('sidebar-collapsed', 'true')
    } else {
      // Si on épingle, étendre automatiquement
      setIsCollapsed(false)
      localStorage.setItem('sidebar-collapsed', 'false')
    }
  }

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    
    // Sauvegarder la préférence utilisateur
    localStorage.setItem('sidebar-collapsed', newCollapsedState.toString())
    
    // Si on étend manuellement, épingler automatiquement
    if (!newCollapsedState && !isPinned) {
      setIsPinned(true)
      localStorage.setItem('sidebar-pinned', 'true')
    }
  }

  // Déterminer si on doit afficher le contenu complet
  const shouldShowContent = () => {
    // Sur mobile, toujours afficher le contenu quand ouvert
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return isOpen
    }
    
    // Sur desktop, afficher le contenu si pas réduit OU en survol
    return !isCollapsed || isHovered
  }

  // Calculer la largeur de la sidebar
  const getSidebarWidth = () => {
    // Sur mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return isOpen ? 320 : 0
    }
    
    // Sur desktop
    if (isCollapsed && !isHovered) {
      return 64 // Mode icônes seulement
    }
    
    return 320 // Mode complet
  }

  const showContent = shouldShowContent()
  const sidebarWidth = getSidebarWidth()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={clsx(
          'fixed inset-y-0 left-0 z-50 bg-yellow-50 dark:bg-dark-900 border-r border-yellow-200 dark:border-dark-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full relative">
          {/* Logo & Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-yellow-200 dark:border-dark-700 bg-yellow-50 dark:bg-dark-900 min-h-[80px]">
            <AnimatePresence mode="wait">
              {showContent ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-3"
                >
                  <img 
                    src="/CreditPro.svg" 
                    alt="CreditPro Logo" 
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <h1 className="text-xl font-bold">
                      <span className="text-gray-900 dark:text-white">Credit</span>
                      <span className="text-red-500">Pro</span>
                    </h1>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Transfert Avancé</p>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="mx-auto"
                >
                  <img 
                    src="/CreditPro.svg" 
                    alt="CreditPro Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pin/Unpin Button - seulement visible quand étendu */}
            {showContent && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={togglePin}
                className="p-1.5 rounded-lg hover:bg-yellow-100 dark:hover:bg-dark-800 transition-colors group"
                title={isPinned ? 'Détacher le menu' : 'Épingler le menu'}
              >
                {isPinned ? (
                  <Pin className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                ) : (
                  <PinOff className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                )}
              </motion.button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center rounded-lg transition-all duration-200 group relative',
                    showContent ? 'px-3 py-3' : 'px-2 py-3 justify-center',
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 shadow-sm border-l-4 border-primary-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-dark-800'
                  )
                }
                title={!showContent ? item.name : undefined}
              >
                <div className={clsx(
                  'flex items-center flex-1 min-w-0',
                  showContent ? 'space-x-3' : 'justify-center'
                )}>
                  {/* Icône avec position fixe */}
                  <div className={clsx(
                    'flex-shrink-0 flex items-center justify-center',
                    showContent ? 'w-5 h-5' : 'w-5 h-5'
                  )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  
                  {/* Texte avec animation */}
                  <AnimatePresence mode="wait">
                    {showContent && (
                      <motion.div
                        key="expanded-text"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ 
                          duration: 0.2,
                          ease: 'easeInOut'
                        }}
                        className="flex-1 min-w-0 overflow-hidden"
                      >
                        <span className="font-semibold truncate text-base whitespace-nowrap">
                          {item.name}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tooltip for collapsed state */}
                {!showContent && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    <div className="font-semibold">{item.name}</div>
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer - seulement visible quand étendu */}
          <AnimatePresence>
            {showContent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 border-t border-yellow-200 dark:border-dark-700 bg-yellow-50 dark:bg-dark-900"
              >
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                    CreditPro v1.0.0
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 dark:text-green-400 font-medium">Opérationnel</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Algérie 🇩🇿</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse/Expand Button - Toujours visible sur desktop */}
          {typeof window !== 'undefined' && window.innerWidth >= 1024 && (
            <button
              className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 z-20 cursor-pointer group"
              onClick={toggleCollapse}
              title={isCollapsed ? 'Étendre le menu' : 'Réduire le menu'}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
              </motion.div>
            </button>
          )}
        </div>
      </motion.div>
    </>
  )
}