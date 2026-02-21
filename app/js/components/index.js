import OffCanvas from './ui/off-canvas'
import CartUi from './cart/cart-ui'

export const registerCriticalComponents = () => {
  customElements.define('off-canvas', OffCanvas)
  customElements.define('cart-ui', CartUi)
}

export const registerDereredComponents = () => {} 