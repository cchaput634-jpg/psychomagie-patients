import { motion } from 'motion/react'
import { Calendar, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { daysSince } from '@/lib/dates'
import type { Patient } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PatientCardProps {
  patient: Patient
  onTogglePriority: (v: boolean) => void
  onToggleRdv: (v: boolean) => void
  onEdit: () => void
  onDelete: () => void
}

export function PatientCard({
  patient,
  onTogglePriority,
  onToggleRdv,
  onEdit,
  onDelete,
}: PatientCardProps) {
  const days = daysSince(patient.lastSeen)

  // Accent gauche : ambre = prioritaire, sky = RDV proposé, neutre sinon.
  const accent = patient.rdvProposed
    ? 'border-l-sky-400'
    : patient.priority
      ? 'border-l-amber-500'
      : 'border-l-zinc-200'

  // Badge d'urgence temporelle (file standard uniquement).
  let urgencyBadge: { label: string; variant: 'green' | 'warn' | 'red' } | null = null
  if (days !== null && !patient.rdvProposed) {
    if (days >= 60) urgencyBadge = { label: `${days} j sans suivi`, variant: 'red' }
    else if (days >= 30) urgencyBadge = { label: `${days} j sans suivi`, variant: 'warn' }
    else urgencyBadge = { label: `${days} j`, variant: 'green' }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
    >
      <Card className={cn('p-4 border-l-4', accent)}>
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-foreground truncate">{patient.name}</h4>
              {patient.priority && !patient.rdvProposed && (
                <Badge variant="amber">Prioritaire</Badge>
              )}
              {patient.rdvProposed && <Badge variant="sky">RDV proposé</Badge>}
              {urgencyBadge && <Badge variant={urgencyBadge.variant}>{urgencyBadge.label}</Badge>}
            </div>

            <div className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Vu le {patient.lastSeen || '—'}
            </div>

            {patient.notes && (
              <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap line-clamp-3">
                {patient.notes}
              </p>
            )}

            <div className="mt-3 flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
                <Switch
                  checked={patient.priority}
                  onCheckedChange={onTogglePriority}
                  tone="amber"
                  aria-label="Prioritaire"
                />
                <span>⭐ Prioritaire</span>
              </label>
              <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
                <Switch
                  checked={patient.rdvProposed}
                  onCheckedChange={onToggleRdv}
                  tone="sky"
                  aria-label="RDV proposé"
                />
                <span>📅 RDV proposé</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1 shrink-0">
            <Button size="icon" variant="ghost" onClick={onEdit} title="Modifier">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              title="Supprimer"
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
