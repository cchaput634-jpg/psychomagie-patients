import { useEffect, useRef, useState } from 'react'
import { ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react'
import type { ProfileMeta } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SidebarProps {
  profiles: ProfileMeta[]
  activeId: string | null
  homeActive: boolean
  onGoHome: () => void
  onSelect: (id: string) => void
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export function Sidebar({
  profiles,
  activeId,
  homeActive,
  onGoHome,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: SidebarProps) {
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (creating || editingId) inputRef.current?.focus()
  }, [creating, editingId])

  function submitCreate(e?: React.FormEvent) {
    e?.preventDefault()
    const name = draft.trim()
    if (name) onCreate(name)
    setDraft('')
    setCreating(false)
  }

  function submitRename(e?: React.FormEvent) {
    e?.preventDefault()
    if (editingId && editingName.trim()) onRename(editingId, editingName.trim())
    setEditingId(null)
  }

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <img
          src="/Psychomagie-removebg.png"
          alt="Psychomagie"
          className="w-14 h-14 object-contain shrink-0 rounded-xl p-1.5"
          style={{ background: 'linear-gradient(135deg, #2e1650 0%, #432373 100%)' }}
          onError={e => {
            // Repli sur le sigil texte si le logo n'est pas encore en place.
            const img = e.currentTarget
            img.style.display = 'none'
            const fallback = img.nextElementSibling as HTMLElement | null
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div
          style={{ display: 'none', background: 'linear-gradient(135deg, #2e1650 0%, #432373 100%)' }}
          className="w-14 h-14 rounded-xl items-center justify-center text-purple-200 text-xl font-semibold"
        >
          Ψ
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">Cabinet</div>
          <div className="text-[11px] text-muted-foreground leading-tight">Psychomagie · Suivi</div>
        </div>
      </div>

      {/* Accueil — comptes rendus de réunion (hors profil) */}
      <div className="px-2 pt-3">
        <button
          onClick={onGoHome}
          className={cn(
            'w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
            homeActive ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-foreground',
          )}
        >
          <ClipboardList className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">Comptes rendus</span>
        </button>
      </div>

      <div className="px-3 pt-4 pb-1 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          Profils
        </span>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="w-3 h-3" /> Nouveau
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        {profiles.length === 0 && !creating && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            Aucun profil.
            <br />
            Cliquez sur « Nouveau ».
          </div>
        )}

        {profiles.map(p => {
          const isActive = p.id === activeId
          const isEditing = editingId === p.id
          return (
            <div
              key={p.id}
              className={cn(
                'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors',
                isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-foreground',
              )}
              onClick={() => !isEditing && onSelect(p.id)}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
              {isEditing ? (
                <form onSubmit={submitRename} className="flex-1">
                  <input
                    ref={inputRef}
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onBlur={submitRename}
                    onKeyDown={e => {
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="w-full bg-white border border-input rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </form>
              ) : (
                <span className="flex-1 truncate">{p.name}</span>
              )}
              <span className="text-[11px] text-muted-foreground tabular-nums">{p.count}</span>

              {!isEditing && (
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-1">
                  <button
                    title="Renommer"
                    onClick={e => {
                      e.stopPropagation()
                      setEditingId(p.id)
                      setEditingName(p.name)
                    }}
                    className="p-1 rounded hover:bg-white/60"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    title="Supprimer"
                    onClick={e => {
                      e.stopPropagation()
                      if (
                        confirm(
                          `Supprimer le profil « ${p.name} » et tous ses patients ?`,
                        )
                      )
                        onDelete(p.id)
                    }}
                    className="p-1 rounded hover:bg-white/60 text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {creating && (
          <form onSubmit={submitCreate} className="px-2 py-1.5">
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={submitCreate}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  setCreating(false)
                  setDraft('')
                }
              }}
              placeholder="Nom du profil…"
              className="w-full bg-white border border-input rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </form>
        )}
      </nav>

      <div className="px-4 py-3 border-t border-border text-[11px] text-muted-foreground leading-snug flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        Synchronisé avec la base de données
      </div>
    </aside>
  )
}
