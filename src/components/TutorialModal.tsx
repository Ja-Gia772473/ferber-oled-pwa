import { ChevronLeft, ChevronRight, Moon, Play, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'

interface TutorialModalProps { onDone: () => void }

const steps = [
  { icon: Play, title: 'Start bedtime', copy: 'Choose a night plan, then start the timer when your baby is put down.' },
  { icon: RotateCcw, title: 'Respond calmly', copy: 'When an interval ends, check in first. Resume starts the next interval. Reset only when crying resumes during an active interval.' },
  { icon: Moon, title: 'Track sleep', copy: 'Tap Fell asleep to begin an elapsed sleep clock. End the session when the night is finished.' }
]

export function TutorialModal({ onDone }: TutorialModalProps) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  const Icon = current.icon
  return <div className="modal-backdrop"><section className="tutorial-modal" role="dialog" aria-modal="true" aria-labelledby="tutorial-title"><button className="tutorial-close icon-button" aria-label="Skip tutorial" onClick={onDone}><X size={20} /></button><div className="tutorial-icon"><Icon size={28} /></div><p className="eyebrow">A quiet beginning · 0{step + 1} / 03</p><h2 id="tutorial-title">{current.title}</h2><p>{current.copy}</p><div className="tutorial-dots">{steps.map((item, index) => <span className={index === step ? 'active' : ''} key={item.title} />)}</div><div className="tutorial-actions">{step > 0 && <button className="secondary-action" onClick={() => setStep((value) => value - 1)}><ChevronLeft size={17} /> Back</button>}{step < steps.length - 1 ? <button className="primary-action" onClick={() => setStep((value) => value + 1)}>Next <ChevronRight size={17} /></button> : <button className="primary-action" onClick={onDone}>Got it <Moon size={17} /></button>}</div></section></div>
}