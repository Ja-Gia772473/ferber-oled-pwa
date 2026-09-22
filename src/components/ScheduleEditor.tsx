import { RotateCcw, Save, X } from 'lucide-react'
import { createDefaultScheduleMap, validateDaySchedule } from '../domain/schedule'
import type { ScheduleMap } from '../domain/types'

interface ScheduleEditorProps {
  schedule: ScheduleMap
  onSave: (schedule: ScheduleMap) => void
  onClose: () => void
}

export function ScheduleEditor({ schedule, onSave, onClose }: ScheduleEditorProps) {
  const draft = structuredClone(schedule) as ScheduleMap
  const update = (day: number, index: number, value: string) => {
    draft[day][index] = Number(value)
  }
  const save = () => {
    if (Object.values(draft).every((values) => validateDaySchedule(values))) onSave(draft)
  }
  return (
    <div className="modal-backdrop">
      <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="schedule-title">
        <header className="modal-header"><div><p className="eyebrow">Personal method</p><h2 id="schedule-title">Adjust intervals</h2></div><button className="icon-button" aria-label="Close interval settings" onClick={onClose}><X size={21} /></button></header>
        <p className="modal-copy">Set three check-in intervals for each day. Values are minutes and repeat the final value after the third check.</p>
        <div className="schedule-grid">{Array.from({ length: 14 }, (_, index) => index + 1).map((day) => <div className="schedule-row" key={day}><strong>Day {day}</strong>{draft[day].map((value, interval) => <label key={interval}><span>{interval + 1}</span><input type="number" min="1" max="180" defaultValue={value} onChange={(event) => update(day, interval, event.target.value)} /></label>)}</div>)}</div>
        <footer className="modal-actions"><button className="secondary-action" onClick={() => onSave(createDefaultScheduleMap())}><RotateCcw size={17} /> Restore defaults</button><button className="primary-action" onClick={save}><Save size={17} /> Save intervals</button></footer>
      </section>
    </div>
  )
}