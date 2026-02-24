export function requestWhenIdle(callback) {
  return typeof window.requestIdleCallback == 'function'
    ? window.requestIdleCallback(callback)
    : setTimeout(callback)
}

export function yieldToThread() {

}

export function debounce() {

}

export function throttle() {

}