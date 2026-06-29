import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import type { ActiveProfile, Patient, PatientInput, ProfileMeta } from './types'

/**
 * Store branché sur l'API Cloudflare (D1).
 * - Les profils sont chargés au démarrage.
 * - Les patients du profil actif sont chargés à la sélection (mis en cache).
 * - Les mutations sont optimistes : l'UI réagit tout de suite, puis on
 *   resynchronise avec le serveur en cas d'écart / d'erreur.
 */
export function useAppStore() {
  const [profiles, setProfiles] = useState<ProfileMeta[]>([])
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [patientsByProfile, setPatientsByProfile] = useState<Record<string, Patient[]>>({})

  const [loading, setLoading] = useState(true)
  const [patientsLoading, setPatientsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function reportError(e: unknown) {
    setErrorMsg(e instanceof Error ? e.message : String(e))
  }

  // --- Chargement initial des profils ---
  const reloadProfiles = useCallback(async () => {
    const list = await api.listProfiles()
    setProfiles(list)
    setActiveProfileId(prev => {
      if (prev && list.some(p => p.id === prev)) return prev
      return list[0]?.id ?? null
    })
    return list
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        await reloadProfiles()
      } catch (e) {
        reportError(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [reloadProfiles])

  // --- Chargement des patients du profil actif (si pas encore en cache) ---
  useEffect(() => {
    if (!activeProfileId) return
    if (patientsByProfile[activeProfileId]) return
    let cancelled = false
    setPatientsLoading(true)
    api
      .listPatients(activeProfileId)
      .then(list => {
        if (!cancelled) setPatientsByProfile(prev => ({ ...prev, [activeProfileId]: list }))
      })
      .catch(reportError)
      .finally(() => {
        if (!cancelled) setPatientsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeProfileId, patientsByProfile])

  const activeProfile: ActiveProfile | null = (() => {
    if (!activeProfileId) return null
    const meta = profiles.find(p => p.id === activeProfileId)
    if (!meta) return null
    return { id: meta.id, name: meta.name, patients: patientsByProfile[activeProfileId] ?? [] }
  })()

  // Aide : modifie la liste de patients du profil actif en cache.
  function mutateActivePatients(fn: (list: Patient[]) => Patient[]) {
    if (!activeProfileId) return
    setPatientsByProfile(prev => ({
      ...prev,
      [activeProfileId]: fn(prev[activeProfileId] ?? []),
    }))
  }

  function bumpCount(profileId: string, delta: number) {
    setProfiles(prev =>
      prev.map(p => (p.id === profileId ? { ...p, count: Math.max(0, p.count + delta) } : p)),
    )
  }

  // --- Profils ---
  const selectProfile = useCallback((id: string) => setActiveProfileId(id), [])

  const createProfile = useCallback(async (name: string) => {
    try {
      const profile = await api.createProfile(name)
      setProfiles(prev => [...prev, profile])
      setPatientsByProfile(prev => ({ ...prev, [profile.id]: [] }))
      setActiveProfileId(profile.id)
    } catch (e) {
      reportError(e)
    }
  }, [])

  const renameProfile = useCallback(async (id: string, name: string) => {
    setProfiles(prev => prev.map(p => (p.id === id ? { ...p, name } : p)))
    try {
      await api.renameProfile(id, name)
    } catch (e) {
      reportError(e)
      reloadProfiles().catch(reportError)
    }
  }, [reloadProfiles])

  const deleteProfile = useCallback(
    async (id: string) => {
      setProfiles(prev => prev.filter(p => p.id !== id))
      setPatientsByProfile(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setActiveProfileId(prev => (prev === id ? null : prev))
      try {
        await api.deleteProfile(id)
      } catch (e) {
        reportError(e)
        reloadProfiles().catch(reportError)
      }
    },
    [reloadProfiles],
  )

  // --- Patients ---
  const addPatient = useCallback(
    async (data: PatientInput) => {
      if (!activeProfileId) return
      const profileId = activeProfileId
      try {
        const patient = await api.createPatient(profileId, data)
        setPatientsByProfile(prev => ({
          ...prev,
          [profileId]: [...(prev[profileId] ?? []), patient],
        }))
        bumpCount(profileId, +1)
      } catch (e) {
        reportError(e)
      }
    },
    [activeProfileId],
  )

  const updatePatient = useCallback(
    async (id: string, data: PatientInput) => {
      mutateActivePatients(list =>
        list.map(p => (p.id === id ? { ...p, ...data } : p)),
      )
      try {
        await api.updatePatient(id, data)
      } catch (e) {
        reportError(e)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeProfileId],
  )

  const deletePatient = useCallback(
    async (id: string) => {
      const profileId = activeProfileId
      mutateActivePatients(list => list.filter(p => p.id !== id))
      if (profileId) bumpCount(profileId, -1)
      try {
        await api.deletePatient(id)
      } catch (e) {
        reportError(e)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeProfileId],
  )

  const togglePatientFlag = useCallback(
    async (id: string, field: 'priority' | 'rdvProposed', value: boolean) => {
      mutateActivePatients(list =>
        list.map(p => (p.id === id ? { ...p, [field]: value } : p)),
      )
      try {
        await api.setPatientFlag(id, field, value)
      } catch (e) {
        reportError(e)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeProfileId],
  )

  return {
    profiles,
    activeProfileId,
    activeProfile,
    loading,
    patientsLoading,
    errorMsg,
    dismissError: () => setErrorMsg(null),
    selectProfile,
    createProfile,
    renameProfile,
    deleteProfile,
    addPatient,
    updatePatient,
    deletePatient,
    togglePatientFlag,
  }
}
