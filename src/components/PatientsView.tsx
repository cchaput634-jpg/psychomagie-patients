import { useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Plus, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PatientCard } from './PatientCard'
import { PatientForm } from './PatientForm'
import { sortPatients } from '@/lib/sort'
import type { ActiveProfile, Patient, PatientInput } from '@/lib/types'

interface PatientsViewProps {
  profile: ActiveProfile
  loading?: boolean
  onAdd: (data: PatientInput) => void
  onUpdate: (id: string, data: PatientInput) => void
  onDelete: (id: string) => void
  onToggleFlag: (id: string, field: 'priority' | 'rdvProposed', value: boolean) => void
}

export function PatientsView({
  profile,
  loading = false,
  onAdd,
  onUpdate,
  onDelete,
  onToggleFlag,
}: PatientsViewProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [filter, setFilter] = useState('')

  const sorted = useMemo(() => sortPatients(profile.patients), [profile.patients])
  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase()
    if (!f) return sorted
    return sorted.filter(
      p =>
        p.name.toLowerCase().includes(f) ||
        (p.notes || '').toLowerCase().includes(f),
    )
  }, [sorted, filter])

  const stats = useMemo(() => {
    let prio = 0
    let std = 0
    let rdv = 0
    for (const p of profile.patients) {
      if (p.rdvProposed) rdv++
      else if (p.priority) prio++
      else std++
    }
    return { prio, std, rdv, total: profile.patients.length }
  }, [profile.patients])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* En-tête */}
      <div className="px-8 py-5 border-b border-border bg-surface">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{profile.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {stats.total} patient{stats.total > 1 ? 's' : ''} ·{' '}
              <span className="text-amber-700">
                {stats.prio} prioritaire{stats.prio > 1 ? 's' : ''}
              </span>{' '}
              · <span className="text-foreground">{stats.std} en file</span> ·{' '}
              <span className="text-sky-700">
                {stats.rdv} RDV proposé{stats.rdv > 1 ? 's' : ''}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              className="w-56"
              placeholder="Rechercher un patient…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4" />
              Nouveau patient
            </Button>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <div className="w-7 h-7 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <p className="text-sm">Chargement des patients…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm text-muted-foreground">
              {profile.patients.length
                ? 'Aucun patient ne correspond à la recherche.'
                : 'Aucun patient pour le moment.'}
            </p>
            {!profile.patients.length && (
              <Button className="mt-4" onClick={() => setShowAdd(true)}>
                Ajouter le premier patient
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {filtered.map(p => (
                <PatientCard
                  key={p.id}
                  patient={p}
                  onTogglePriority={v => onToggleFlag(p.id, 'priority', v)}
                  onToggleRdv={v => onToggleFlag(p.id, 'rdvProposed', v)}
                  onEdit={() => setEditing(p)}
                  onDelete={() => {
                    if (confirm(`Retirer « ${p.name} » de la liste ?`)) onDelete(p.id)
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modale ajout */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau patient</DialogTitle>
          </DialogHeader>
          <PatientForm
            onCancel={() => setShowAdd(false)}
            onSubmit={data => {
              onAdd(data)
              setShowAdd(false)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modale édition */}
      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le patient</DialogTitle>
          </DialogHeader>
          {editing && (
            <PatientForm
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
