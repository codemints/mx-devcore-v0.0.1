import { camelCase, toDash } from '@lib/utils/string-formatting'
import { requestWhenIdle } from '@lib/utils/performance'

class Component extends HTMLElement {
  constructor() {
    super()
    this.refs = {}
    this.requiredRefs = []
  }
  
  connectedCallback() {
    registerEventBinding()
    this.#setRefs()

    requestWhenIdle(() => {
      this.#observer.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['ref'],
        attributeOldValue: true,
      })
    })
  }

  updatedCallback() {
    this.#observer.takeRecords()
    this.#setRefs()
  }

  disconnectedCallback() {
    this.#observer.disconnect()
  }

  #setRefs() {
    const refs = {}
    const elements = Array.from(this.querySelectorAll('[ref]'))

    for (const node of elements) {
      if (!this.#owned(node)) continue

      const refName = node.getAttribute('ref') ?? ''
      const isList = refName.startsWith('[]')
      const refPath = isList ? refName.slice(2) : refName
      const path = camelCase(refPath)

      if (isList) {
        const arr = Array.isArray(refs[path]) ? refs[path] : []
        arr.push(node)
        refs[path] = arr
      } else {
        refs[path] = node
      }
    }

    if(this.requiredRefs.length) {
      for (const ref of this.requiredRefs) {
        if(!(ref in refs)) {
          throw new RequiredRefError(ref, this)
        }
      }
    }

    this.refs = refs
  }

  #observer = new MutationObserver((mutations) => {
    const shouldUpdate = mutations.some((m) => {
      return (
        m.type === 'attributes' && this.#owned(m.target) ||
        m.type === 'childList' && [...m.addedNodes, ...m.removedNodes].some(this.#owned)
      )
    })

    if (shouldUpdate) this.#setRefs()
  })

  #owned = (node) => getClosestComponent(node.parentNode) === this
}

const key = '-ui'
let registered = false

function registerEventBinding() {
  if (registered) return
  registered = true

  const names = ['click', 'change', 'select', 'focus', 'blur', 'submit', 'input', 'keydown', 'keyup', 'toggle', 'pointerenter', 'pointerleave']
  const bubbles = ['focus', 'blur']
  const expensive = ['pointerenter', 'pointerleave']

  for (const name of names) document.addEventListener(name, bindElementEvent, { capture: true })

  function bindElementEvent(event) {
    const binding = `on:${event.type}`
    const element = getElement(event)

    if (!element) return

    const eventProxy = event.target === element
      ? event
      : new Proxy(event, {
          get(target, property) {
            if (property === 'target') return element
            const value = Reflect.get(target, property)
            if (typeof value === 'function') return value.bind(target)
            return value
          }
        })

    const value = element.getAttribute(binding) ?? ''
    const [selector, raw] = value.split('/')

    if (!raw) return

    const [method, data] = raw.split(':')

    const component = selector
      ? selector.startsWith('#')
        ? document.querySelector(selector)
        : element.closest(selector)
      : getClosestComponent(element)

    if (!(component instanceof Component) || !method) return

    const callback = component[method]

    if (typeof callback === 'function') {
      try {
        const args = [eventProxy]

        if (data) args.unshift(...parseParams(data))

        callback.call(component, ...args)
      } catch (error) {
        console.error(error)
      }
    }
  }

  function getElement(event) {
    const target = event.composedPath?.()[0] ?? event.target
    const type = event.type

    if(!(target instanceof Element)) return
    if (target.hasAttribute(`on:${type}`)) return target
    if (expensive.includes(type)) return null

    return event.bubbles || bubbles.includes(type)
      ? target.closest(`[on\\:${type}]`)
      : null
  }
}

function getClosestComponent(node) {
  if (!node) return null

  if (node instanceof Component) return node

  if (node instanceof HTMLElement && node.tagName.toLowerCase().endsWith(key)) return node

  const ancestor = node.parentNode
  if (ancestor) return getClosestComponent(ancestor)

  return null
}

function parseParams(str) {
  const params = str.split(',')

  return params.map(item => parseType(item))
}

function parseType(str) {
  if (str === 'null') return null
  if (str === 'true') return true
  if (str === 'false') return false

  const num = Number(str)
  if (!isNaN(num) && str.trim() !== '') return num

  return str
}

class RequiredRefError extends Error {
  constructor(ref, component) {
    super(`Missing required ref ${ref} in ${component.tagName.toLowerCase()}. Required refs: ${component.requiredRefs.map(ref => toDash(ref)).join(',')}`)
  }
}

export default Component