/**
 * Parsing strict du format JJ/MM/AA (ou JJ/MM/AAAA toléré).
 * Rejette les dates invalides (ex. 31/02/26).
 */
export function parseDateFR(str: string | undefined | null): Date | null {
  if (!str) return null
  const m = str.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}(?:\d{2})?)$/)
  if (!m) return null
  const day = Number(m[1])
  const month = Number(m[2])
  let year = Number(m[3])
  if (m[3].length === 2) year = year < 50 ? 2000 + year : 1900 + year
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null
  return d
}

export function formatDateFR(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)
  return `${dd}/${mm}/${yy}`
}

export function todayFR(): string {
  return formatDateFR(new Date())
}

export function daysSince(str: string | undefined | null): number | null {
  const d = parseDateFR(str)
  if (!d) return null
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
}
