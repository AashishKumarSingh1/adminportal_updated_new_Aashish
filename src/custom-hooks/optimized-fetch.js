'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Cache for API responses
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Optimized data fetching hook with caching and error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @param {Object} dependencies - Dependencies that trigger refetch
 * @returns {Object} - { data, loading, error, refetch }
 */
export function useOptimizedFetch(url, options = {}, dependencies = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)

  const getCacheKey = useCallback(() => {
    return `${url}_${JSON.stringify(options)}_${JSON.stringify(dependencies)}`
  }, [url, options, dependencies])

  const fetchData = useCallback(async (force = false) => {
    const cacheKey = getCacheKey()
    
    // Check cache first (unless forced)
    if (!force) {
      const cached = cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data)
        setLoading(false)
        return
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Cache the result
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })

      setData(result)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
        console.error('Fetch error:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [url, options, getCacheKey])

  // Initial fetch
  useEffect(() => {
    fetchData()

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData])

  // Refetch function
  const refetch = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  return { data, loading, error, refetch }
}

/**
 * Hook for optimized profile data fetching
 * @param {string} email - User email
 * @returns {Object} - Profile data and utilities
 */
export function useProfileData(email) {
  const { data, loading, error, refetch } = useOptimizedFetch(
    email ? `/api/faculty?type=${email}` : null,
    { method: 'GET' },
    { email }
  )

  return {
    profile: data,
    loading,
    error,
    refetch
  }
}

/**
 * Hook for batch data fetching (multiple API calls)
 * @param {Array} requests - Array of request objects
 * @returns {Object} - Batch results
 */
export function useBatchFetch(requests) {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!requests || requests.length === 0) {
      setLoading(false)
      return
    }

    const fetchAll = async () => {
      setLoading(true)
      const batchResults = {}
      const batchErrors = {}

      await Promise.all(
        requests.map(async (request) => {
          try {
            const response = await fetch(request.url, request.options)
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            batchResults[request.key] = data
          } catch (err) {
            batchErrors[request.key] = err.message
          }
        })
      )

      setResults(batchResults)
      setErrors(batchErrors)
      setLoading(false)
    }

    fetchAll()
  }, [requests])

  return { results, loading, errors }
}

/**
 * Clear cache for specific keys or all
 * @param {string|Array} keys - Cache keys to clear
 */
export function clearCache(keys = null) {
  if (!keys) {
    cache.clear()
  } else if (Array.isArray(keys)) {
    keys.forEach(key => cache.delete(key))
  } else {
    cache.delete(keys)
  }
}

// Cleanup expired cache entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key)
    }
  }
}, CACHE_DURATION)
