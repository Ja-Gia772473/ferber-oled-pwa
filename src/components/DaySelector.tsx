interface DaySelectorProps {
  dayNumber: number
  disabled: boolean
  onChange: (dayNumber: number) => void
}

export function DaySelector({ dayNumber, disabled, onChange }: DaySelectorProps) {
  return (
    <label className="day-selector">
      <span>Night plan</span>
      <select value={dayNumber} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))}>
        {Array.from({ length: 14 }, (_, index) => index + 1).map((day) => (
          <option key={day} value={day}>Day {day}</option>
        ))}
      </select>
    </label>
  )
}