export function playIntervalCompleteFeedback(): void {
  if ('vibrate' in navigator) navigator.vibrate([300, 200, 300, 200, 600])

  try {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = 220
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.8)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.85)
    oscillator.addEventListener('ended', () => void context.close())
  } catch {
    // Audio is an optional enhancement; timer correctness does not depend on it.
  }
}