import { signal, computed } from '@core/signal';

/** @type {Map<string, object>} */
const registry = new Map();

/**
 * Creates a named singleton store powered by signals.
 *
 * @param {string} name - Unique store identifier.
 * @param {() => object} setup - Factory that returns signals, computeds, and actions.
 * @returns {() => object} A composable that returns the store instance.
 */
export function createStore(name, setup) {
  let store = null;

  function getOrCreate() {
    if (store) return store;

    if (registry.has(name)) {
      store = registry.get(name);
      return store;
    }

    const state = setup();

    store = {
      ...state,
      $name: name,

      /**
       * Logs and returns a snapshot of all reactive values in the store.
       * Signals/computeds resolve to their current value, functions show as '[action]'.
       *
       * @returns {object} Plain object snapshot.
       */
      $inspect() {
        const snapshot = {};

        for (const [key, val] of Object.entries(state)) {
          if (key.startsWith('$')) continue;

          if (isReactive(val)) {
            snapshot[key] = val.value;
          } else if (typeof val === 'function') {
            snapshot[key] = '[action]';
          } else {
            snapshot[key] = val;
          }
        }

        console.log(`[Store:${name}]`, snapshot);
        return snapshot;
      },
    };

    registry.set(name, store);
    return store;
  }

  return getOrCreate;
}

/**
 * Retrieves a store by name from the registry.
 * Returns null if the store hasn't been initialized yet.
 *
 * @param {string} name - The store name.
 * @returns {object | null}
 */
export function getStore(name) {
  return registry.get(name) ?? null;
}

/**
 * Duck-type check for signal/computed objects.
 *
 * @param {unknown} val
 * @returns {boolean}
 */
function isReactive(val) {
  return val !== null && typeof val === 'object' && 'value' in val;
}