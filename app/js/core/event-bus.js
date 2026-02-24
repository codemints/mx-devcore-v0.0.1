const listeners = new Map();
const contextIndex = new WeakMap();

/**
 * Subscribes to an event. Returns an unsubscribe function.
 *
 * @param {string} event - The event name to listen for.
 * @param {Function} callback - The function to call when the event is dispatched.
 * @param {object|null} [context=null] - The context to bind the callback to. Enables bulk cleanup via cleanupContext.
 * @returns {() => void} A function that removes this listener.
 */
export function on(event, callback, context = null) {
  if (!listeners.has(event)) {
    listeners.set(event, []);
  }

  const entry = { callback, context };
  listeners.get(event).push(entry);

  if (context) {
    if (!contextIndex.has(context)) {
      contextIndex.set(context, []);
    }
    contextIndex.get(context).push({ event, callback });
  }

  return () => off(event, callback, context);
}

/**
 * Removes a specific listener for an event.
 *
 * @param {string} event - The event name to stop listening to.
 * @param {Function} callback - The callback to remove.
 * @param {object|null} [context=null] - The context the callback was registered with.
 */
export function off(event, callback, context = null) {
  const list = listeners.get(event);
  if (!list) return;

  const index = list.findIndex(l => l.callback === callback && l.context === context);
  if (index === -1) return;

  list.splice(index, 1);

  if (list.length === 0) {
    listeners.delete(event);
  }

  if (context && contextIndex.has(context)) {
    const entries = contextIndex.get(context);
    const i = entries.findIndex(e => e.event === event && e.callback === callback);
    if (i > -1) entries.splice(i, 1);
  }
}

/**
 * Dispatches an event to all registered listeners.
 *
 * @param {string} event - The event name to dispatch.
 * @param {object} [data={}] - Data to pass to each listener callback.
 */
export function dispatch(event, data = {}) {
  const list = listeners.get(event);
  if (!list) return;

  for (const { callback, context } of list) {
    try {
      callback.call(context, data);
    } catch (error) {
      console.error(`[EventBus] "${event}":`, error);
    }
  }
}

/**
 * Removes all listeners associated with a given context.
 * Intended for use in disconnectedCallback to prevent leaks.
 *
 * @param {object} context - The context whose listeners should be removed.
 */
export function cleanupContext(context) {
  if (!context) return;

  for (const [event, list] of listeners) {
    const filtered = list.filter(l => l.context !== context);

    if (filtered.length === 0) {
      listeners.delete(event);
    } else {
      listeners.set(event, filtered);
    }
  }

  contextIndex.delete(context);
}