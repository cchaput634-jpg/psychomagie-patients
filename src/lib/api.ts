import type { Patient, PatientInput, ProfileMeta } from './types'

// --- Mapping ligne SQL -> modèle client ---
interface PatientRow {
  id: string
  profile_id: string
  name: string
  last_seen: string
  notes: string
  priority: number
  rdv_proposed: number
  created_at: string
}

interface ProfileRow {
  id: string
  name: string
  created_at: string
  patient_count: number
}

function mapPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    name: row.name,
    lastSeen: row.last_seen ?? '',
    notes: row.notes ?? '',
    priority: !!row.priority,
    rdvProposed: !!row.rdv_proposed,
    createdAt: row.created_at,
  }
}

function mapProfile(row: ProfileRow): ProfileMeta {
  return { id: row.id, name: row.name, count: row.patient_count ?? 0 }
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    let msg = `Erreur ${res.status}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body?.error) msg = body.error
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  return (await res.json()) as T
}

// --- Profils ---
export const api = {
  async listProfiles(): Promise<ProfileMeta[]> {
    const rows = await req<ProfileRow[]>('/api/profiles')
    return rows.map(mapProfile)
  },

  async createProfile(name: string): Promise<ProfileMeta> {
    const row = await req<ProfileRow>('/api/profiles', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    return mapProfile(row)
  },

  async renameProfile(id: string, name: string): Promise<void> {
    await req(`/api/profiles/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) })
  },

  async deleteProfile(id: string): Promise<void> {
    await req(`/api/profiles/${id}`, { method: 'DELETE' })
  },

  // --- Patients ---
  async listPatients(profileId: string): Promise<Patient[]> {
    const rows = await req<PatientRow[]>(`/api/patients?profileId=${encodeURIComponent(profileId)}`)
    return rows.map(mapPatient)
  },

  async createPatient(profileId: string, data: PatientInput): Promise<Patient> {
    const row = await req<PatientRow>('/api/patients', {
      method: 'POST',
      body: JSON.stringify({
        profile_id: profileId,
        name: data.name,
        last_seen: data.lastSeen,
        notes: data.notes,
      }),
    })
    return mapPatient(row)
  },

  async updatePatient(id: string, data: PatientInput): Promise<void> {
    await req(`/api/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: data.name, last_seen: data.lastSeen, notes: data.notes }),
    })
  },

  async setPatientFlag(
    id: string,
    field: 'priority' | 'rdvProposed',
    value: boolean,
  ): Promise<void> {
    const key = field === 'priority' ? 'priority' : 'rdv_proposed'
    await req(`/api/patients/${id}`, { method: 'PATCH', body: JSON.stringify({ [key]: value }) })
  },

  async deletePatient(id: string): Promise<void> {
    await req(`/api/patients/${id}`, { method: 'DELETE' })
  },
}
