import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface PageLoaderProps {
  isStructureLoading: boolean
  isDataLoading: boolean
  error?: string | null
  children: React.ReactNode
  structureSkeleton?: React.ReactNode
  dataSkeleton?: React.ReactNode
  title?: string
  retryCount?: number
  onRetry?: () => void
}

export function PageLoader({
  isStructureLoading,
  isDataLoading,
  error,
  children,
  structureSkeleton,
  dataSkeleton,
  title = 'Chargement',
  retryCount = 0,
  onRetry
}: PageLoaderProps) {
  // Erreur critique - structure non chargée
  if (error && isStructureLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center max-w-md mx-auto p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <AlertCircle className="w-8 h-8 text-red-500" />
          </motion.div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Erreur de chargement
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            {error}
          </p>
          
          {retryCount > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Tentative {retryCount}/3
            </p>
          )}
          
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={onRetry || (() => window.location.reload())}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Réessayer</span>
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Structure en cours de chargement
  if (isStructureLoading) {
    return structureSkeleton || (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-dark-700 rounded-lg w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 dark:bg-dark-700 rounded-lg w-32 animate-pulse"></div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-dark-700"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-24 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 dark:bg-dark-700 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-20 animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-dark-700 rounded-xl animate-pulse"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                <div className="h-6 bg-gray-200 dark:bg-dark-700 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-64 animate-pulse"></div>
              </div>
              <div className="p-6">
                <div className="h-64 bg-gray-200 dark:bg-dark-700 rounded animate-pulse"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <div className="h-6 bg-gray-200 dark:bg-dark-700 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-64 animate-pulse"></div>
          </div>
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-dark-700 rounded animate-pulse"></div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Structure chargée, données en cours
  return (
    <div className="relative">
      <AnimatePresence>
        {isDataLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl"
          >
            {dataSkeleton || (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700"
              >
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                  <div className="flex items-center space-x-1">
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Connecté
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {title}...
                </p>
                {retryCount > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Tentative {retryCount}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={isDataLoading ? 'pointer-events-none' : ''}
      >
        {children}
      </motion.div>

      {/* Erreur non critique (données seulement) */}
      <AnimatePresence>
        {error && !isStructureLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-50 max-w-md"
          >
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
              <div className="flex items-start space-x-3">
                <WifiOff className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Erreur de chargement
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  {retryCount > 0 && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Tentative {retryCount}/3
                    </p>
                  )}
                </div>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}