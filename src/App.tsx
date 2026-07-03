import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { PatientsView } from '@/components/PatientsView'
import { MeetingsView } from '@/components/MeetingsView'
import { useAppStore } from '@/lib/store'
import { useMeetings } from '@/lib/meetings'

type View = 'home' | 'profile'

export default function App() {
  const {
    profiles,
    activeProfileId,
    activeProfile,
    loading,
    patientsLoading,
    errorMsg,
    dismissError,
    selectProfile,
    createProfile,
    renameProfile,
    deleteProfile,
    addPatient,
    updatePatient,
    deletePatient,
    togglePatientFlag,
  } = useAppStore()

  const {
    meetings,
    meetingsLoading,
    meetingsError,
    dismissMeetingsError,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  } = useMeetings()

  // L'app démarre sur l'accueil (comptes rendus de réunion).
  const [view, setView] = useState<View>('home')

  function handleSelectProfile(id: string) {
    selectProfile(id)
    setView('profile')
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm">Connexion à la base de données…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-background">
      <Sidebar
        profiles={profiles}
        activeId={view === 'profile' ? activeProfileId : null}
        homeActive={view === 'home'}
        onGoHome={() => setView('home')}
        onSelect={handleSelectProfile}
        onCreate={id => {
          createProfile(id)
          setView('profile')
        }}
        onRename={renameProfile}
        onDelete={deleteProfile}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {view === 'home' ? (
          <MeetingsView
            meetings={meetings}
            loading={meetingsLoading}
            error={meetingsError}
            onDismissError={dismissMeetingsError}
            onCreate={createMeeting}
            onUpdate={updateMeeting}
            onDelete={deleteMeeting}
          />
        ) : (
          <>
            {errorMsg && (
              <div className="bg-destructive/10 text-destructive text-sm px-6 py-2 flex items-center justify-between gap-4">
                <span>⚠️ {errorMsg}</span>
                <button onClick={dismissError} className="text-xs underline hover:no-underline">
                  Masquer
                </button>
              </div>
            )}

            {activeProfile ? (
              <PatientsView
                key={activeProfile.id}
                profile={activeProfile}
                loading={patientsLoading}
                onAdd={addPatient}
                onUpdate={updatePatient}
                onDelete={deletePatient}
                onToggleFlag={togglePatientFlag}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-semibold mb-4">
                    Ψ
                  </div>
                  <h2 className="text-lg font-semibold">Aucun profil sélectionné</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Créez un profil dans la barre latérale pour commencer à suivre vos patients.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
