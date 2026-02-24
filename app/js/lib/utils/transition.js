// ─── Duration Conversion ─────────────────────────────────────────────

/**
 * Convert a CSS duration value to milliseconds.
 * Handles both seconds ("0.3s") and milliseconds ("300ms").
 *
 * @param {string|number} value - CSS duration string or numeric seconds
 * @returns {number} Duration in milliseconds
 */
const toMs = (value) => {
  const num = parseFloat(value)
  return String(value).endsWith('ms') ? num : num * 1000
}

/**
 * Convert milliseconds to seconds.
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {number} Duration in seconds
 */
const toSeconds = (ms) => ms / 1000

// ─── Transition Duration Resolution ──────────────────────────────────

/**
 * Get a map of all transition properties and their durations for an element.
 * Handles CSS shorthand cycling where fewer durations than properties
 * repeat through the list.
 *
 * @param {HTMLElement} element
 * @returns {Map<string, number>} Map of property name → duration in ms
 */
const getTransitionDurations = (element) => {
  const style = getComputedStyle(element)
  const properties = style.transitionProperty.split(',').map(p => p.trim())
  const durations = style.transitionDuration.split(',').map(d => toMs(d.trim()))

  const map = new Map()

  properties.forEach((prop, i) => {
    const duration = durations[i % durations.length] || 0
    if (prop !== 'none' && duration > 0) map.set(prop, duration)
  })

  return map
}

/**
 * Resolve the duration for a specific transition property on an element.
 * If the property isn't found, falls back to the shortest or longest duration.
 *
 * @param {HTMLElement} element
 * @param {string|null} property - CSS property to match (e.g. 'opacity', 'height')
 * @param {'shortest'|'longest'} fallback - Which duration to use if property not found
 * @returns {{ property: string|null, duration: number }}
 */
const resolveDuration = (element, property = null, fallback = 'longest') => {
  const durations = getTransitionDurations(element)

  if (durations.size === 0) return { property: null, duration: 0 }

  if (property && durations.has(property)) {
    return { property, duration: durations.get(property) }
  }

  if (property === 'all' || durations.has('all')) {
    const allDuration = durations.get('all')
    if (allDuration) return { property: 'all', duration: allDuration }
  }

  const values = [...durations.entries()]
  const [resolvedProp, resolvedDuration] = fallback === 'shortest'
    ? values.reduce((a, b) => a[1] <= b[1] ? a : b)
    : values.reduce((a, b) => a[1] >= b[1] ? a : b)

  return { property: resolvedProp, duration: resolvedDuration }
}

// ─── Transition Callbacks ────────────────────────────────────────────

/**
 * Execute a callback after an element's CSS transition ends.
 * Uses both a transitionend listener and a safety timeout.
 * If the resolved duration is 0, the callback fires immediately.
 *
 * @param {object} config
 * @param {HTMLElement} config.element - The transitioning element
 * @param {Function} config.callback - Function to call when transition completes
 * @param {string|null} [config.property] - Specific CSS property to watch
 * @param {'shortest'|'longest'} [config.fallback] - Fallback strategy if property not found
 * @param {number} [config.buffer] - Extra ms added to the safety timeout
 */
const onTransitionEnd = ({ element, callback, property = null, fallback = 'longest', buffer = 25 }) => {
  if (!element) throw new Error('No element provided for transition callback')

  const { property: watchedProp, duration } = resolveDuration(element, property, fallback)

  if (duration === 0) {
    callback()
    return
  }

  let done = false

  const complete = () => {
    if (done) return
    done = true
    clearTimeout(timeoutId)
    element.removeEventListener('transitionend', listener)
    callback()
  }

  const listener = (event) => {
    if (event.target !== element) return
    if (watchedProp && watchedProp !== 'all' && event.propertyName !== watchedProp) return
    complete()
  }

  element.addEventListener('transitionend', listener)
  const timeoutId = setTimeout(complete, duration + buffer)
}

/**
 * Promise-based wrapper around onTransitionEnd.
 *
 * @param {HTMLElement} element - The transitioning element
 * @param {object} [options] - Same options as onTransitionEnd (minus element and callback)
 * @returns {Promise<void>}
 */
const awaitTransition = (element, options = {}) => {
  return new Promise((resolve) => {
    onTransitionEnd({ element, callback: resolve, ...options })
  })
}

export {
  toMs,
  toSeconds,
  getTransitionDurations,
  resolveDuration,
  onTransitionEnd,
  awaitTransition,
}