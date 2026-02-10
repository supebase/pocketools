// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@vueuse/nuxt', '@nuxt/eslint'],

  runtimeConfig: {
    NUXT_POCKETBASE_URL: import.meta.env.NUXT_POCKETBASE_URL,
    public: {
      GITHUB_COMMIT_URL: import.meta.env.GITHUB_COMMIT_URL,
    }
  },

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

  ui: {
    fonts: false,
  },

  css: ['~/assets/app.css'],

  eslint: {
    config: {
      stylistic: {
        semi: false,
        quotes: 'single',
        indent: 2,
        commaDangle: 'always-multiline'
      }
    }
  }
})