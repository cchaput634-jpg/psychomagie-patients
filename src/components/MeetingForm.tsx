import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { parseDateFR, todayFR } from '@/lib/dates'
import type { Meeting, MeetingInput } from '@/lib/types'

interface MeetingFormProps {
  initial?: Meeting
  onSubmit: (data: MeetingInput) => void
  onCancel: () => void
}

export function MeetingForm({ initial, onSubmit, onCancel }: MeetingFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [meetingDate, setMeetingDate] = useState(initial?.meetingDate ?? todayFR())
  const [attendees, setAttendees] = useState(initial?.attendees ?? '')
  const [theme, setTheme] = useState(initial?.theme ?? '')
  const [infos, setInfos] = useState(initial?.infos ?? '')
  const [ideas, setIdeas] = useState(initial?.ideas ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Le titre est requis.')
      return
    }
    if (meetingDate && !parseDateFR(meetingDate)) {
      setError('Date invalide. Format attendu : JJ/MM/AA')
      return
    }
    setError('')
    onSubmit({
      title: title.trim(),
      meetingDate: meetingDate.trim(),
      attendees: attendees.trim(),
      theme: theme.trim(),
      infos: infos.trim(),
      ideas: ideas.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="title">Titre de la réunion</Label>
          <Input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex. Réunion mensuelle du cercle"
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mdate">Date (JJ/MM/AA)</Label>
          <Input
            id="mdate"
            className="w-32"
            value={meetingDate}
            onChange={e => setMeetingDate(e.target.value)}
            placeholder="14/03/26"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="attendees">Personnes présentes</Label>
        <Textarea
          id="attendees"
          className="min-h-[60px]"
          value={attendees}
          onChange={e => setAttendees(e.target.value)}
          placeholder="Noms des participants, séparés par des virgules ou des retours à la ligne…"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="theme">Thème général</Label>
        <Textarea
          id="theme"
          className="min-h-[60px]"
          value={theme}
          onChange={e => setTheme(e.target.value)}
          placeholder="Sujet principal de la réunion…"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="infos">Infos transmises</Label>
        <Textarea
          id="infos"
          value={infos}
          onChange={e => setInfos(e.target.value)}
          placeholder="Informations communiquées, annonces, décisions…"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ideas">Idées échangées</Label>
        <Textarea
          id="ideas"
          value={ideas}
          onChange={e => setIdeas(e.target.value)}
          placeholder="Propositions, pistes, points à approfondir…"
        />
      </div>

      {error && <div className="text-xs text-destructive">{error}</div>}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">{initial ? 'Enregistrer' : 'Créer le compte rendu'}</Button>
      </div>
    </form>
  )
}
