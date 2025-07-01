import { useState, useEffect, useCallback } from 'react'

interface LoadingState {
  structure: boolean
  data: boolean
  error: string | null
}

interface UsePageLoaderOptions {
  structureDelay?: number
  dataDelay?: number
  enableCache?: boolean
  cacheKey?: string
  dependencies?: any[]
  retryAttempts?: number
}

export function usePageLoader<T>(
  dataLoader: () => Promise<T>,
  options: UsePageLoaderOptions = {}
) {
  const {
    structureDelay = 0,
    dataDelay = 50, // Réduit de 100ms à 50ms
    enableCache = true,
    cacheKey,
    dependencies = [],
    retryAttempts = 3
  } = options

  const [loading, setLoading] = useState<LoadingState>({
    structure: true,
    data: true,
    error: null
  })
  
  const [data, setData] = useState<T | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Cache intelligent avec gestion d'expiration
  const getCachedData = useCallback(() => {
    if (!enableCache || !cacheKey) return null
    
    try {
      const cached = sessionStorage.getItem(`page_cache_${cacheKey}`)
      if (cached) {
        const { data: cachedData, timestamp, version } = JSON.parse(cached)
        const currentVersion = '1.0.0'
        
        // Cache valide pendant 5 minutes et même version
        if (Date.now() - timestamp < 5 * 60 * 1000 && version === currentVersion) {
          return cachedData
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error)
      try {
        sessionStorage.removeItem(`page_cache_${cacheKey}`)
      } catch {}
    }
    return null
  }, [enableCache, cacheKey])

  const setCachedData = useCallback((data: T) => {
    if (!enableCache || !cacheKey) return
    
    try {
      sessionStorage.setItem(`page_cache_${cacheKey}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0.0'
      }))
    } catch (error) {
      console.warn('Cache write error:', error)
      try {
        const keys = Object.keys(sessionStorage)
        const cacheKeys = keys.filter(key => key.startsWith('page_cache_'))
        if (cacheKeys.length > 10) {
          cacheKeys.slice(0, 5).forEach(key => sessionStorage.removeItem(key))
        }
      } catch {}
    }
  }, [enableCache, cacheKey])

  const loadData = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(prev => ({ ...prev, error: null }))
        setRetryCount(0)
      }

      // 1. Charger la structure immédiatement (pas de délai)
      setLoading(prev => ({ ...prev, structure: false }))

      // 2. Vérifier le cache pour les données
      if (!isRetry) {
        const cachedData = getCachedData()
        if (cachedData) {
          setData(cachedData)
          // Délai minimal pour éviter le flash
          setTimeout(() => {
            setLoading(prev => ({ ...prev, data: false }))
          }, Math.max(dataDelay, 25))
          return
        }
      }

      // 3. Charger les données depuis l'API
      const startTime = performance.now()
      const result = await dataLoader()
      const loadTime = performance.now() - startTime

      // Log des performances en développement
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PageLoader] ${cacheKey} loaded in ${loadTime.toFixed(2)}ms`)
      }
      
      // 4. Mettre en cache et afficher les données immédiatement
      setCachedData(result)
      setData(result)
      
      // Délai minimal pour éviter le flash, mais pas plus de 50ms
      const finalDelay = Math.min(Math.max(dataDelay, 25), 50)
      setTimeout(() => {
        setLoading(prev => ({ ...prev, data: false }))
      }, finalDelay)

    } catch (error) {
      console.error('Data loading error:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement'
      
      // Retry logic
      if (retryCount < retryAttempts) {
        setRetryCount(prev => prev + 1)
        console.log(`[PageLoader] Retry ${retryCount + 1}/${retryAttempts} for ${cacheKey}`)
        
        // Délai exponentiel pour les tentatives
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000)
        setTimeout(() => loadData(true), retryDelay)
        return
      }

      setLoading(prev => ({
        ...prev,
        structure: false,
        data: false,
        error: errorMessage
      }))
    }
  }, [dataLoader, structureDelay, dataDelay, getCachedData, setCachedData, retryCount, retryAttempts, cacheKey])

  const reload = useCallback(() => {
    setLoading({ structure: true, data: true, error: null })
    setData(null)
    setRetryCount(0)
    loadData()
  }, [loadData])

  const clearCache = useCallback(() => {
    if (cacheKey) {
      try {
        sessionStorage.removeItem(`page_cache_${cacheKey}`)
      } catch {}
    }
  }, [cacheKey])

  useEffect(() => {
    loadData()
  }, dependencies)

  return {
    loading,
    data,
    reload,
    clearCache,
    isLoading: loading.structure || loading.data,
    isStructureLoading: loading.structure,
    isDataLoading: loading.data,
    error: loading.error,
    retryCount
  }
}