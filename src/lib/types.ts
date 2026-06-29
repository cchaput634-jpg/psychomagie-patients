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
