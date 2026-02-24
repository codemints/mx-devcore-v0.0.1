import CartUi from './cart/cart-ui'
import OffcanvasUi from './ui/offcanvas-ui'
import OverlayUi from './ui/overlay-ui'
import SliderUi from './ui/slider-ui'

export const registerCriticalComponents = () => {
  customElements.define('cart-ui', CartUi)
  customElements.define('offcanvas-ui', OffcanvasUi)
  customElements.define('overly-ui', OverlayUi)
  customElements.define('slider-ui', SliderUi)
}

export const registerDereredComponents = () => {} 