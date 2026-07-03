import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CalendarDays, ClipboardList, Pencil, Plus, Trash2, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MeetingForm } from './MeetingForm'
import type { Meeting, MeetingInput } from '@/lib/types'

interface MeetingsViewProps {
  meetings: Meeting[]
  loading?: boolean
  error?: string | null
  onDismissError?: () => void
  onCreate: (data: MeetingInput) => void
  onUpdate: (id: string, data: MeetingInput) => void
  onDelete: (id: string) => void
}

function Section({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="mt-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
      <p className="text-sm text-foreground/85 whitespace-pre-wrap mt-0.5">{value}</p>
    </div>
  )
}

export function MeetingsView({
  meetings,
  loading = false,
  error,
  onDismissError,
  onCreate,
  onUpdate,
  onDelete,
}: MeetingsViewProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Meeting | null>(null)
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase()
    if (!f) return meetings
    return meetings.filter(
      m =>
        m.title.toLowerCase().includes(f) ||
        m.theme.toLowerCase().includes(f) ||
        m.attendees.toLowerCase().includes(f),
    )
  }, [meetings, filter])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* En-tête */}
      <div className="px-8 py-5 border-b border-border bg-surface">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Comptes rendus de réunion
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {meetings.length} compte{meetings.length > 1 ? 's' : ''} rendu
              {meetings.length > 1 ? 's' : ''} enregistré{meetings.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              className="w-56"
              placeholder="Rechercher…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4" />
              Nouvelle réunion
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm px-8 py-2 flex items-center justify-between gap-4">
          <span>⚠️ {error}</span>
          {onDismissError && (
            <button onClick={onDismissError} className="text-xs underline hover:no-underline">
              Masquer
            </button>
          )}
        </div>
      )}

      {/* Liste */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <div className="w-7 h-7 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <p className="text-sm">Chargement des comptes rendus…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <ClipboardList className="w-5 h-5" />
            </div>
            <p className="text-sm text-muted-foreground">
              {meetings.length
                ? 'Aucun compte rendu ne correspond à la recherche.'
                : 'Aucun compte rendu pour le moment.'}
            </p>
            {!meetings.length && (
              <Button className="mt-4" onClick={() => setShowAdd(true)}>
                Créer le premier compte rendu
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {filtered.map(m => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                >
                  <Card className="p-5 border-l-4 border-l-primary/40">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{m.title}</h3>
                        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          {m.meetingDate && (
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" /> {m.meetingDate}
                            </span>
                          )}
                          {m.attendees && (
                            <span className="inline-flex items-center gap-1">
                              <Users className="w-3 h-3" /> {m.attendees.split(/[,\n]/).filter(s => s.trim()).length} présent(s)
                            </span>
                          )}
                        </div>

                        <Section label="Personnes présentes" value={m.attendees} />
                        <Section label="Thème général" value={m.theme} />
                        <Section label="Infos transmises" value={m.infos} />
                        <Section label="Idées échangées" value={m.ideas} />
                      </div>

                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditing(m)}
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Supprimer le compte rendu « ${m.title} » ?`)) onDelete(m.id)
                          }}
                          title="Supprimer"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modale création */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau compte rendu</DialogTitle>
          </DialogHeader>
          <MeetingForm
            onCancel={() => setShowAdd(false)}
            onSubmit={data => {
              onCreate(data)
              setShowAdd(false)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modale édition */}
      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le compte rendu</DialogTitle>
          </DialogHeader>
          {editing && (
            <MeetingForm
              initial={editing}
              onCancel={() => setEditing(null)}
              onSubmit={data => {
                onUpdate(editing.id, data)
                setEditing(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
