export interface Patient {
  id: string
  name: string
  /** Format JJ/MM/AA */
  lastSeen: string
  notes: string
  priority: boolean
  rdvProposed: boolean
  createdAt: string
}

/** Métadonnées d'un profil (sans la liste complète des patients). */
export interface ProfileMeta {
  id: string
  name: string
  count: number
}

/** Profil actif, avec ses patients chargés. */
export interface ActiveProfile {
  id: string
  name: string
  patients: Patient[]
}

export type PatientInput = Pick<Patient, 'name' | 'lastSeen' | 'notes'>

/** Compte rendu de réunion (indépendant des profils). */
export interface Meeting {
  id: string
  title: string
  /** Format JJ/MM/AA */
  meetingDate: string
  /** Personnes présentes */
  attendees: string
  /** Thème général */
  theme: string
  /** Infos transmises */
  infos: string
  /** Idées échangées */
  ideas: string
  createdAt: string
}

export type MeetingInput = Pick<
  Meeting,
  'title' | 'meetingDate' | 'attendees' | 'theme' | 'infos' | 'ideas'
>
