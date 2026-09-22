import { Check, Moon, Pause, Play, RotateCcw, Sparkles, Square } from 'lucide-react'

interface TimerControlsProps {
  status: string
  onStart: () => void
  onReset: () => void
  onCheckIn: () => void
  onResume: () => void
  onAsleep: () => void
  onEnd: () => void
}

export function TimerControls({ status, onStart, onReset, onCheckIn, onResume, onAsleep, onEnd }: TimerControlsProps) {
  if (status === 'idle' || status === 'ended') return <button className="primary-action" onClick={onStart}><Play size={21} fill="currentColor" /> Start bedtime</button>
  if (status === 'asleep') return <button className="primary-action" onClick={onEnd}><Square size={18} fill="currentColor" /> End session</button>
  if (status === 'check_in') return <div className="control-stack"><button className="primary-action" onClick={onResume}><Play size={20} fill="currentColor" /> Resume interval</button><p className="running-note"><Check size={14} /> Check-in logged</p></div>
  return (
    <div className="control-stack">
      {status === 'complete' ? <button className="primary-action" onClick={onCheckIn}><Sparkles size={20} /> Check in</button> : <button className="reset-action" onClick={onReset}><RotateCcw size={19} /> Reset interval <span>Crying resumed</span></button>}
      <div className="secondary-actions"><button className="secondary-action" onClick={onAsleep}><Moon size={18} /> Fell asleep</button><button className="secondary-action" onClick={onEnd}><Square size={16} /> End</button></div>
      {status === 'running' && <p className="running-note"><Pause size={14} /> Timer is running</p>}
    </div>
  )
}