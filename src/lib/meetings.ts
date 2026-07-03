import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import type { Meeting, MeetingInput } from './types'

/**
 * Gestion des comptes rendus de réunion (indépendants des profils).
 * Chargés au premier affichage, mutations optimistes.
 */
export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const reportError = (e: unknown) =>
    setErrorMsg(e instanceof Error ? e.message : String(e))

  const reload = useCallback(async () => {
    const list = await api.listMeetings()
    setMeetings(list)
    return list
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        await reload()
      } catch (e) {
        reportError(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [reload])

  const createMeeting = useCallback(async (data: MeetingInput) => {
    try {
      const meeting = await api.createMeeting(data)
      setMeetings(prev => [meeting, ...prev])
    } catch (e) {
      reportError(e)
    }
  }, [])

  const updateMeeting = useCallback(async (id: string, data: MeetingInput) => {
    setMeetings(prev => prev.map(m => (m.id === id ? { ...m, ...data } : m)))
    try {
      await api.updateMeeting(id, data)
    } catch (e) {
      reportError(e)
    }
  }, [])

  const deleteMeeting = useCallback(async (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id))
    try {
      await api.deleteMeeting(id)
    } catch (e) {
      reportError(e)
    }
  }, [])

  return {
    meetings,
    meetingsLoading: loading,
    meetingsError: errorMsg,
    dismissMeetingsError: () => setErrorMsg(null),
    createMeeting,
    updateMeeting,
    deleteMeeting,
  }
}
