// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@vueuse/nuxt', '@nuxt/eslint'],

  runtimeConfig: {
    public: {
      GITHUB_COMMIT_URL: import.meta.env.GITHUB_COMMIT_URL,
    }
  },

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