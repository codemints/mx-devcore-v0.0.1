# MX DevCore
## A theme development framework for Shopify

A minimal, opinionated starting point for building custom Shopify themes. DevCore provides the commerce foundation — cart management, product forms, variant selection, and a reactive state system — so new theme projects start with a proven core rather than from scratch.

### Stack

- **Vite** — build tooling and dev server
- **Tailwind CSS** — utility-first styling with sensible defaults
- **Motion.js** — animation library
- **Splide** — lightweight slider/carousel
- **Vanilla JS** — no framework dependency, module-based architecture

### What's Included

**Commerce**
- Reactive cart store with full `/cart.js` API integration
- Product form system (variant selector, quantity, subscription, add to cart)
- Product card and PDP component patterns
- Cart drawer with line item management

**Layout**
- Header
- Footer
- Menu drawer / mobile navigation

**Base Components**
- Slider (Splide)
- Animation primitives (Motion.js)
- Tailwind configuration with minimal, extendable defaults

### What's Not Included

This is not a finished theme. DevCore handles commerce logic, core layout, and base components. Page templates, marketing sections, and brand-specific design are built per project on top of this foundation.

### Getting Started
```bash
npm install
npm run dev
```

### Versioning

This project follows [semver](https://semver.org/). Currently in initial development (`0.x.x`). The API is not yet stable.

### License

Proprietary — Moxie Sozo internal use only.