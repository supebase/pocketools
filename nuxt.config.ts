// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@vueuse/nuxt', '@nuxt/eslint'],
  devtools: { enabled: true },

  css: ['~/assets/app.css'],

  ui: {
    fonts: false,
  },

  runtimeConfig: {
    NUXT_POCKETBASE_URL: import.meta.env.NUXT_POCKETBASE_URL,
    public: {
      GITHUB_COMMIT_URL: import.meta.env.GITHUB_COMMIT_URL,
    },
  },
  compatibilityDate: '2025-07-15',

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    compressPublicAssets: {
      brotli: true,
      gzip: true,
    },
    minify: true,
    routeRules: {
      '/v1/**': {
        proxy: `${import.meta.env.NUXT_POCKETBASE_URL}/**`,
      },
    },
  },

  eslint: {
    config: {
      stylistic: {
        semi: false,
        quotes: 'single',
        indent: 2,
        commaDangle: 'always-multiline',
      },
    },
  },
})
