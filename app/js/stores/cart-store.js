import { createStore } from '@lib/composables/create-store'
import { signal, computed, batch } from '@core/signal'
import { formatMoney } from '@lib/utils/money-formatting'

export const useCartStore = createStore('cart', () => {
  const routes = window.Theme?.routes ?? {}

  // State
  const attributes = signal({})
  const cart = signal({})
  const currency = signal('USD')
  const error = signal(null)
  const isInitialized = signal(false)
  const isLoading = signal(false)
  const items = signal([])
  const moneyFormat = signal('{{amount}}')
  const note = signal(null)
  const priceDiscount = signal(0)
  const priceSubtotal = signal(0)
  const priceTotal = signal(0)
  const token = signal(null)
  const weight = signal(0)

  // Derived
  const isEmpty = computed(() => items.value.length === 0)
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )
  const hasError = computed(() => error.value !== null)
  const formattedTotal = computed(() => formatMoney(priceTotal.value, moneyFormat.value, currency.value))
  const formattedSubtotal = computed(() => formatMoney(priceSubtotal.value, moneyFormat.value, currency.value))
  const formattedDiscount = computed(() => formatMoney(priceDiscount.value, moneyFormat.value, currency.value))

  // Internal helpers
  function syncCartToState(data) {
    batch(() => {
      attributes.value = data.attributes || {}
      cart.value = data
      currency.value = data.currency || 'USD'
      items.value = data.items || []
      note.value = data.note || null
      priceDiscount.value = data.total_discount || 0
      priceSubtotal.value = data.items_subtotal_price || 0
      priceTotal.value = data.total_price || 0
      token.value = data.token || null
      weight.value = data.total_weight || 0
    })
  }

  async function apiRequest(errorMessage, operation) {
    isLoading.value = true
    error.value = null

    try {
      const data = await operation()
      syncCartToState(data)
      return { ok: true, data, error: null }
    } catch (err) {
      error.value = err.message
      console.error(errorMessage, err)
      return { ok: false, data: {}, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function post(endpoint, payload, sectionIds = []) {
    if (sectionIds.length) {
      payload.sections = sectionIds.join(',')
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.description || `Request to ${endpoint} failed`)
    }

    return response.json()
  }

  async function fetchFullCart() {
    const response = await fetch(routes.cart || '/cart.js')
    return response.json()
  }

  // Actions

  async function fetchCart() {
    return apiRequest('CartStore: failed to fetch cart:', fetchFullCart)
  }

  async function initialize() {
    if (isInitialized.value) return

    if (window.Theme?.cart) {
      syncCartToState(window.Theme.cart)
    } else {
      await fetchCart()
    }

    if (window.Theme?.money) {
      moneyFormat.value = window.Theme.money.format || moneyFormat.value
      currency.value = window.Theme.money.currency || currency.value
    }

    isInitialized.value = true
  }

  async function addItem(variantId, quantity = 1, options = {}, sectionIds = []) {
    return apiRequest('CartStore: failed to add item:', async () => {
      const addRespnse = await post(routes.cartAdd || '/cart/add.js', {
        items: [{ id: variantId, quantity, ...options }],
      }, sectionIds)

      const cartResponse = await fetchFullCart()

      if (addResponse.sections) {
        cartResponse.sections = {
          ...cartResponse.sections,
          ...addResponse.sections,
        }
      }

      return cartResponse
    })
  }

  async function removeItem(key) {
    return apiRequest('CartStore: failed to remove item:', () =>
      post(routes.cartChange || '/cart/change.js', { id: key, quantity: 0 })
    )
  }

  async function updateQuantity(key, quantity) {
    return apiRequest('CartStore: failed to update quantity:', () =>
      post(routes.cartChange || '/cart/change.js', { id: key, quantity })
    )
  }

  async function updateProperties(key, properties) {
    return apiRequest('CartStore: failed to update properties:', () => {
      const item = findItemByKey(key)
      if (!item) throw new Error('Item not found in cart')
      return post(routes.cartChange || '/cart/change.js', { id: key, quantity: item.quantity, properties })
    })
  }

  async function updateSellingPlan(key, sellingPlanId) {
    return apiRequest('CartStore: failed to update selling plan:', () => {
      const item = findItemByKey(key)
      if (!item) throw new Error('Item not found in cart')
      return post(routes.cartChange || '/cart/change.js', { id: key, quantity: item.quantity, selling_plan: sellingPlanId })
    })
  }

  async function updateNote(value) {
    return apiRequest('CartStore: failed to update note:', () =>
      post(routes.cartUpdate || '/cart/update.js', { note: value })
    )
  }

  async function updateAttributes(values) {
    return apiRequest('CartStore: failed to update attributes:', () =>
      post(routes.cartUpdate || '/cart/update.js', { attributes: values })
    )
  }

  async function clearCart() {
    return apiRequest('CartStore: failed to clear cart:', () =>
      post(routes.cartClear || '/cart/clear.js', {})
    )
  }

  // Queries

  function findItemByProperty(path, value) {
    const keys = path.split('.')
    return items.value.find((item) => {
      const resolved = keys.reduce((obj, key) => obj?.[key], item)
      return resolved === value
    }) ?? null
  }

  function findItemByKey(key) {
    return findItemByProperty('key', key)
  }

  function findItemByVariantId(variantId) {
    return findItemByProperty('variant_id', variantId)
  }

  function findItemByProductId(productId) {
    return findItemByProperty('product_id', productId)
  }

  function findItemByLine(lineIndex) {
    return items.value[lineIndex - 1] ?? null
  }

  // Public API
  return {
    attributes, cart, currency, error, isInitialized, isLoading,
    items, moneyFormat, note, priceDiscount, priceSubtotal, priceTotal,
    token, weight,

    isEmpty, itemCount, hasError,
    formattedTotal, formattedSubtotal, formattedDiscount,

    initialize, fetchCart, addItem, removeItem, updateQuantity,
    updateProperties, updateSellingPlan, updateNote, updateAttributes, clearCart,

    findItemByKey, findItemByVariantId, findItemByProductId,
    findItemByProperty, findItemByLine,
  }
})