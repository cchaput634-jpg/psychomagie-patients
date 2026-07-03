import type { Meeting, MeetingInput, Patient, PatientInput, ProfileMeta } from './types'

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

interface MeetingRow {
  id: string
  title: string
  meeting_date: string
  attendees: string
  theme: string
  infos: string
  ideas: string
  created_at: string
}

function mapMeeting(row: MeetingRow): Meeting {
  return {
    id: row.id,
    title: row.title,
    meetingDate: row.meeting_date ?? '',
    attendees: row.attendees ?? '',
    theme: row.theme ?? '',
    infos: row.infos ?? '',
    ideas: row.ideas ?? '',
    createdAt: row.created_at,
  }
}

function meetingBody(data: MeetingInput) {
  return {
    title: data.title,
    meeting_date: data.meetingDate,
    attendees: data.attendees,
    theme: data.theme,
    infos: data.infos,
    ideas: data.ideas,
  }
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

  // --- Réunions ---
  async listMeetings(): Promise<Meeting[]> {
    const rows = await req<MeetingRow[]>('/api/meetings')
    return rows.map(mapMeeting)
  },

  async createMeeting(data: MeetingInput): Promise<Meeting> {
    const row = await req<MeetingRow>('/api/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingBody(data)),
    })
    return mapMeeting(row)
  },

  async updateMeeting(id: string, data: MeetingInput): Promise<void> {
    await req(`/api/meetings/${id}`, { method: 'PATCH', body: JSON.stringify(meetingBody(data)) })
  },

  async deleteMeeting(id: string): Promise<void> {
    await req(`/api/meetings/${id}`, { method: 'DELETE' })
  },
}
