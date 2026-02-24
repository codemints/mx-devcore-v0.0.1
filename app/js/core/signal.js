let currentEffect = null;
let batchDepth = 0;
const pendingEffects = new Set();

/**
 * Creates a reactive value that tracks dependencies and notifies subscribers on change.
 *
 * @template T
 * @param {T} initialValue
 * @returns {{ value: T }}
 */
export function signal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  return {
    get value() {
      if (currentEffect) {
        subscribers.add(currentEffect);
        currentEffect.dependencies.add(subscribers);
      }
      return value;
    },
    set value(nextValue) {
      if (nextValue === value) return;
      value = nextValue;

      for (const effect of subscribers) {
        if (batchDepth > 0) {
          pendingEffects.add(effect);
        } else {
          effect.run();
        }
      }
    },
  };
}

/**
 * Creates a derived read-only signal that recomputes when its dependencies change.
 *
 * @template T
 * @param {() => T} fn
 * @returns {{ readonly value: T }}
 */
export function computed(fn) {
  let dirty = true;
  let cachedValue;

  const internal = effect(() => {
    dirty = true;
    // If someone is reading us inside another effect, they need to know we changed.
    // Trigger our own subscribers by touching the wrapper signal.
    if (wrapper._subscribers.size > 0) {
      cachedValue = fn();
      dirty = false;
      for (const sub of wrapper._subscribers) {
        if (batchDepth > 0) {
          pendingEffects.add(sub);
        } else {
          sub.run();
        }
      }
    }
  }, { lazy: true });

  const wrapper = {
    _subscribers: new Set(),
    get value() {
      if (currentEffect) {
        wrapper._subscribers.add(currentEffect);
        currentEffect.dependencies.add(wrapper._subscribers);
      }

      if (dirty) {
        cachedValue = fn();
        dirty = false;
      }

      // Ensure the internal effect is tracking the signals that fn() reads.
      if (internal.dependencies.size === 0) {
        internal.run();
      }

      return cachedValue;
    },
  };

  return wrapper;
}

/**
 * Creates a reactive side effect that re-runs when its dependencies change.
 * Returns a dispose function.
 *
 * @param {() => void | (() => void)} fn - Effect function. May return a cleanup function.
 * @param {{ lazy?: boolean }} [options]
 * @returns {{ run: () => void, dispose: () => void, dependencies: Set }}
 */
export function effect(fn, options = {}) {
  let cleanup;

  const self = {
    dependencies: new Set(),

    run() {
      // Clean up previous run
      if (typeof cleanup === 'function') cleanup();

      // Remove this effect from all signals it was tracking
      for (const deps of self.dependencies) {
        deps.delete(self);
      }
      self.dependencies.clear();

      // Re-run with tracking
      const previous = currentEffect;
      currentEffect = self;
      try {
        cleanup = fn();
      } finally {
        currentEffect = previous;
      }
    },

    dispose() {
      if (typeof cleanup === 'function') cleanup();
      for (const deps of self.dependencies) {
        deps.delete(self);
      }
      self.dependencies.clear();
    },
  };

  if (!options.lazy) {
    self.run();
  }

  return self;
}

/**
 * Batches multiple signal writes so effects only run once at the end.
 *
 * @param {() => void} fn
 */
export function batch(fn) {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      for (const effect of pendingEffects) {
        effect.run();
      }
      pendingEffects.clear();
    }
  }
}