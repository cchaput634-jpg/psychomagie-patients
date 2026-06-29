import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { parseDateFR, todayFR } from '@/lib/dates'
import type { Patient, PatientInput } from '@/lib/types'

interface PatientFormProps {
  initial?: Patient
  onSubmit: (data: PatientInput) => void
  onCancel: () => void
}

export function PatientForm({ initial, onSubmit, onCancel }: PatientFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [lastSeen, setLastSeen] = useState(initial?.lastSeen ?? todayFR())
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Le nom est requis.')
      return
    }
    if (lastSeen && !parseDateFR(lastSeen)) {
      setError('Date invalide. Format attendu : JJ/MM/AA')
      return
    }
    setError('')
    onSubmit({ name: name.trim(), lastSeen: lastSeen.trim(), notes: notes.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex. Mélusine Valombre"
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lastSeen">Dernière fois vu (JJ/MM/AA)</Label>
        <Input
          id="lastSeen"
          value={lastSeen}
          onChange={e => setLastSeen(e.target.value)}
          placeholder="14/03/26"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes de suivi</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observations, traitement, prochaine étape…"
        />
      </div>
      {error && <div className="text-xs text-destructive">{error}</div>}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">{initial ? 'Enregistrer' : 'Ajouter le patient'}</Button>
      </div>
    </form>
  )
}
