import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "MX DevCore",
  description: "A minimal, opinionated environment for bootstrapping custom themes in Shopify.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    head: [
      ['link', { rel: 'icon', href: './mx-devcore-favicon.png' }],
    ],

    siteTitle: false,

    logo: {
      light: './mx-devcore-logo-on-light.png',
      dark: './mx-devcore-logo-on-dark.png',
    },

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/getting-started/introduction' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/getting-started/introduction' },
          { text: 'VS Code snippets', link: '/getting-started/vs-code-snippets' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/codemints/mx-devcore-v0.0.1' }
    ]
  }
})
