import Splide from "@splidejs/splide";
import Component from "@js/core/component";

class SliderUi extends Component {
  #mainSettings = null
  #navigationSettings = null
  #modalSettings = null

  #enableNavigation = false
  #enableModal = false

  static mainConfig = {
    type: 'slide',
    perPage: 1,
    perMove: 1,
    gap: 20,
    arrows: false,
    pagination: false,
    autoplay: false,
    pauseOnHover: false,
    pauseOnFocus: false,
    trimSpace: true,
    updateOnMove: true,
    mediaQuery: 'min',
  }

  static navigationConfig = {
    type: 'slide',
    perPage: 4,
    perMove: 1,
    gap: 20,
    arrows: false,
    pagination: false,
    isNavigation: true,
    updateOnMove: true,
    mediaQuery: 'min',
  }

  static modalConfig = {
    mediaQuery: 'min',
  }

  constructor() {
    super()
    // this.requiredRefs = ['mainSliderUi', 'mainSliderTrack', 'mainSliderList']

    // this.mainConfig = null
    // this.navigationConfig = null
    // this.modalConfig = null

    // this.mainSplide = null
    // this.navigationSplide = null
    // this.modalSplide = null
  }

  connectedCallback() {
    super.connectedCallback()
    // this.#initializeSliders()
  }

  updatedCallback() {
    super.updatedCallback()
    // this.#destroySliders()
    // this.#initializeSliders()
  }

  disconnectedCallback() {
    // this.#destroySliders()
    super.disconnectedCallback()
  }

  #initializeSliders() {
    this.#buildSlider('main')

    if (this.#mainSettings.show_slider_navigation && this.refs.navigationSliderUi) {
      this.#enableNavigation = true
      this.#initSecondarySlider('navigation')
    }

    if (this.#mainSettings.show_slider_modal) {
      // Manual ref — modal slider lives inside <overlay-ui> component boundary
      this.refs.modalSliderUi = this.querySelector('[ref="modal-slider-ui"]')

      if (this.refs.modalSliderUi) {
        this.#enableModal = true
        this.#initSecondarySlider('modal')
      }
    }

    this.mainSplide.mount()
  }

  #initSecondarySlider(key) {
    this.#buildSlider(key)
    this.mainSplide.sync(this[`${key}Splide`])
    this.mainSplide.on('mounted', () => this[`${key}Splide`].mount())
  }

  #buildSlider(key) {    
    const configRef = this.refs[`${key}SliderConfig`]
    const defaults = SliderUi[`${key}Config`]
    const settings = this.#parseConfig(configRef)

    let config = { ...defaults }
    let splide = null

    if (Object.entries(settings).length) {
      config = this.#mergeConfigs(settings, defaults, key)
    }

    this[`${key}Config`] = config
    this[`${key}Splide`] = new Splide(this.refs[`${key}SliderUi`], config)

    if (key === 'main') this.#mainSettings = settings
    if (key === 'navigation') this.#navigationSettings = settings
    if (key === 'modal') this.#modalSettings = settings
  }

  #destroySliders() {
    this.mainSplide?.destroy()
    this.navigationSplide?.destroy()
    this.modalSplide?.destroy()

    this.mainSplide = null
    this.navigationSplide = null
    this.modalSplide = null

    this.#enableNavigation = false
    this.#enableModal = false
  }

  #parseConfig(ref) {
    const text = ref?.textContent?.trim()
    return text
      ? JSON.parse(text)
      : {}
  }

  #mergeConfigs(settings, defaults, key) {
    let config = {}

    if (key === 'main') {
      const { type, loop, enable_controls_lg, arrows_sm, arrows_lg, pagination_sm, pagination_lg } = settings

      const parsedType = type === 'fade'
        ? type
        : type === 'slide' && loop === true
          ? 'loop'
          : type

      config = {
        type: parsedType,
        rewind: type === 'fade' && loop === true,
        autoplay: settings.autoplay,
        interval: settings.interval,
        speed: settings.speed,
        arrows: arrows_sm === 'true',
        pagination: pagination_sm === 'true',
        ...(type === 'fade' && {
          perPage: null,
          drag: true,
          snap: false,
        }),
        ...(enable_controls_lg && {
          breakpoints: {
            1024: {
              arrows: arrows_lg === 'true',
              pagination: pagination_sm === 'true',
            },
          },
        }),
      }
    } else if (key === 'navigation') {
      const { per_page_sm, per_page_lg, gap_sm, gap_lg, enable_settings_lg } = settings

      config = {
        perPage: per_page_sm,
        gap: gap_sm,
        ...(enable_settings_lg && {
          breakpoints: {
            1024: {
              perPage: per_page_lg,
              gap: gap_lg,
            },
          },
        })
      }
    } else if (key === 'modal') {
      const { type, enable_controls_lg, enable_settings_lg  } = settings

      const enableControlsLg = enable_controls_lg === 'true'
      const enableSettingsLg = enable_settings_lg === 'true'

      const perPageSm = type === 'fade' ? null : settings.per_page_sm
      const perPageLg = type === 'fade' ? null : settings.per_page_lg

      const gapSm = type === 'fade' ? 0 : settings.gap_sm
      const gapLg = type === 'fade' ? 0 : settings.gap_lg

      const setBreakpoints = enableControlsLg || enableSettingsLg

      config = {
        type,
        perPage: perPageSm,
        gap: gapSm,
        arrows: settings.arrows_sm === 'true',
        pagination: settings.pagination_sm === 'true',
        ...(setBreakpoints && {
          breakpoints: {
            1024: {
              perPage: perPageLg,
              gap: gapLg,
              arrows: settings.arrows_lg === 'true',
              pagination: settings.pagination_lg === 'true',
            },
          },
        }),
      }
    }

    return {
      ...defaults,
      ...config,
    }
  }
}

export default SliderUi