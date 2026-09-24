import { useState } from 'react'
import { CircleHelp, History, Settings, ShieldCheck } from 'lucide-react'
import { DaySelector } from './components/DaySelector'
import { SessionDrawer } from './components/SessionDrawer'
import { ScheduleEditor } from './components/ScheduleEditor'
import { TimerControls } from './components/TimerControls'
import { TimerDisplay } from './components/TimerDisplay'
import { TutorialModal } from './components/TutorialModal'
import { createDefaultScheduleMap, normalizeScheduleMap } from './domain/schedule'
import type { ScheduleMap } from './domain/types'
import { useFerberTimer } from './hooks/useFerberTimer'
import { useWakeLock } from './hooks/useWakeLock'

export default function App() {
  const [dayNumber, setDayNumber] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(() => localStorage.getItem('ferber-tutorial-seen') !== 'true')
  const [scheduleMap, setScheduleMap] = useState<ScheduleMap>(() => {
    try { return normalizeScheduleMap(JSON.parse(localStorage.getItem('ferber-schedules') ?? 'null')) } catch { return createDefaultScheduleMap() }
  })
  const timer = useFerberTimer(dayNumber, scheduleMap)
  useWakeLock(timer.status === 'running')
  const finishTutorial = () => { localStorage.setItem('ferber-tutorial-seen', 'true'); setTutorialOpen(false) }
  const saveSchedules = (next: ScheduleMap) => { setScheduleMap(next); localStorage.setItem('ferber-schedules', JSON.stringify(next)); setSettingsOpen(false) }

  return (
    <main className="app-shell">
      <header className="topbar"><div className="brand-mark"><span>F</span><div><strong>FERBER</strong><small>quiet sleep practice</small></div></div><div className="top-actions"><button className="icon-button" aria-label="Open tutorial" onClick={() => setTutorialOpen(true)}><CircleHelp size={19} /></button><button className="icon-button" aria-label="Adjust intervals" onClick={() => setSettingsOpen(true)}><Settings size={19} /></button><button className="history-button" onClick={() => setDrawerOpen(true)}><History size={19} /> Logs</button></div></header>
      <div className="content-wrap">
        <DaySelector dayNumber={dayNumber} disabled={!['idle', 'ended'].includes(timer.status)} onChange={setDayNumber} />
        <TimerDisplay intervalIndex={timer.intervalIndex} remainingMs={timer.remainingMs} elapsedSleepMs={timer.elapsedSleepMs} schedule={timer.schedule} status={timer.status} />
        <div className="status-line"><ShieldCheck size={15} /> Private on this device <span>•</span> No account needed</div>
      </div>
      <footer className="bottom-controls"><TimerControls status={timer.status} onStart={() => void timer.start()} onReset={() => void timer.resetInterval()} onCheckIn={() => void timer.checkIn()} onResume={() => void timer.resumeInterval()} onAsleep={() => void timer.fellAsleep()} onEnd={() => void timer.end()} /></footer>
      <SessionDrawer open={drawerOpen} activeSessionId={['running', 'complete', 'check_in', 'asleep'].includes(timer.status) ? timer.sessionId : null} onClose={() => setDrawerOpen(false)} />
      {settingsOpen && <ScheduleEditor schedule={scheduleMap} onSave={saveSchedules} onClose={() => setSettingsOpen(false)} />}
      {tutorialOpen && <TutorialModal onDone={finishTutorial} />}
    </main>
  )
}