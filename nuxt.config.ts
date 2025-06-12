// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxt/scripts',
    '@nuxt/ui',
    '@nuxt/eslint',
  ],
  app: {
    head: {
      title: 'PLAIS',
      meta: [
        {
          name: 'description',
          content: 'Polish Association for Information Systems',
        },
        {
          name: 'author',
          content:
            'Alessio Ricciardi, Kacper Kazimierczuk, Wojciech Bieńkowski',
        },
        {
          name: 'keywords',
          content: 'PLAIS, AIS',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0',
        },
        {
          name: 'robots',
          content: 'index, follow',
        },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      API_URL: process.env.API_URL,
    },
  },
  devServer: {
    https: {
      key: './localhost-key.pem',
      cert: './localhost.pem',
    },
  },
})
