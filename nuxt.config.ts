// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    [
      '@storyblok/nuxt',
      {
        /*
        If you would like to use this as a template for your project, simply provide the access token here.
        Also please remove line 14 (usePlugin) as well as the file plugins/storyblok.js.
        */
        accessToken: process.env.STORYBLOK_PREVIEW_TOKEN,
        // usePlugin: true,
      },
    ],
    '@nuxtjs/robots',
  ],
  ssr: process.env.VERCEL_ENV === 'production' ? true : false,
  css: ['~/assets/css/tailwind.css'],
  runtimeConfig: {
    public: {
      templateToken: process.env.STORYBLOK_PREVIEW_TOKEN,
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
})
