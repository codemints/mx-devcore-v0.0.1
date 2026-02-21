export const initTriggers = () => {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-overlay-trigger]')

    if (!trigger) return

    if (trigger.tagName === 'A') event.preventDefault()

    const isOpen = trigger.getAttribute('aria-expanded') === 'true'
    const targetId = trigger.getAttribute('aria-controls')
    const target = document.getElementById(targetId)

    if (target && target.toggle) {
      target.toggle(trigger)

      trigger.setAttribute('aria-expanded', String(!isOpen))
    }
  })
}