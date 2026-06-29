import type { Patient } from './types'
import { parseDateFR } from './dates'

/**
 * Tri hiérarchique :
 *   bucket 0 -> Prioritaire & !RDV   (haut, du plus ancien au plus récent)
 *   bucket 1 -> standard              (du plus ancien au plus récent)
 *   bucket 2 -> RDV proposé           (bas, priorité gelée)
 *
 * Au sein des buckets actifs, une date plus ancienne = plus haut
 * (plus prioritaire à recontacter). Une date absente / invalide est
 * traitée comme « très ancienne » et remonte également.
 */
export function bucketOf(p: Patient): 0 | 1 | 2 {
  if (p.rdvProposed) return 2
  if (p.priority) return 0
  return 1
}

export function sortPatients(patients: Patient[]): Patient[] {
  return [...patients].sort((a, b) => {
    const ba = bucketOf(a)
    const bb = bucketOf(b)
    if (ba !== bb) return ba - bb

    const da = parseDateFR(a.lastSeen)
    const db = parseDateFR(b.lastSeen)
    const ta = da ? da.getTime() : -Infinity
    const tb = db ? db.getTime() : -Infinity
    if (ta !== tb) return ta - tb

    return (a.name || '').localeCompare(b.name || '', 'fr')
  })
}
