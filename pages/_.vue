<template>
  <div>
    <Header :story="story" />
    <component
      v-if="story.content.component"
      :key="story.content._uid"
      :blok="story.content"
      :is="story.content.component"
    />
    <Footer />
  </div>
</template>

<script>
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
export default {
  components: { Header, Footer },
  name: 'home',
  data() {
    return {
      story: { content: {} },
    }
  },
  head() {
    return {
      title: this.story.content.meta.title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.story.content.meta.description,
        },
      ],
    }
  },
  mounted() {
    this.$storybridge(() => {
      const storyblokInstance = new StoryblokBridge()

      // Use the input event for instant update of content
      storyblokInstance.on('input', (event) => {
        if (event.story.id === this.story.id) {
          this.story.content = event.story.content
        }
      })

      // Use the bridge to listen the events
      storyblokInstance.on(['published', 'change'], (event) => {
        this.$nuxt.$router.go({
          path: this.$nuxt.$router.currentRoute,
          force: true,
        })
      })
    })
  },

  async asyncData(context) {
    const version =
      context.query._storyblok || context.isDev ? 'draft' : 'published'

    const languageReq = await context.app.$storyapi.get(`cdn/spaces/me`, {
      version: version,
    })
    const languages = languageReq.data.space.language_codes

    let lang = 'default'
    let segments = context.route.path.split('/').filter((e) => e !== '')
    if (languages.indexOf(segments[0]) !== -1) {
      lang = segments[0]
      segments = segments.slice(1)
    }

    let fullSlug = segments.join('/')
    if (segments.length === 0) {
      fullSlug = 'home'
    }

    if (!context.store.state.settings.loaded) {
      const settingsReq = await context.app.$storyapi.get(
        `cdn/stories/settings`,
        {
          version: version,
          language: lang,
          resolve_relations: 'settings.nav_stories',
        }
      )

      await context.store.commit('settings/setSettings', {
        currentLocale: lang,
        title: settingsReq.data.story.content.title,
        colorScheme: settingsReq.data.story.content.color_scheme,
        logo: settingsReq.data.story.content.logo,
        navItems: settingsReq.data.story.content.nav_stories,
        socials: settingsReq.data.story.content.socials
      })
    }

    let storyReq
    try {
      storyReq = await context.app.$storyapi.get(`cdn/stories/${fullSlug}`, {
        version: version,
        language: lang,
      })
    } catch (e) {
      if (!e.response) {
        console.error(e)
        context.error({
          statusCode: 404,
          message: 'Failed to receive content from api',
        })
      } else {
        console.error(e.response.data)
        context.error({
          statusCode: e.response.status,
          message: e.response.data,
        })
      }
    }

    return storyReq.data
  },
}
</script>
<style lang="postcss">
:root {
  --color: #243746;
  --color-primary: #f87171;
  --color-secondary: #dc2626;
  --bg: #f3f5f4;
  --bg-secondary: #fff;
  --border-color: #ddd;
}

.dark {
  --color: #ebf4f1;
  --color-primary: #f87171;
  --color-secondary: #dc2626;
  --bg: #111827;
  --bg-secondary: #071521;
  --border-color: #0d2538;
}
.sepia {
  --color: #433422;
  --color-secondary: #504231;
  --bg: #f1e7d0;
  --bg-secondary: #eae0c9;
  --border-color: #ded0bf;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--bg);
  color: var(--color);
  transition: background-color 0.3s;
}
a {
  @apply hover:text-black dark:hover:text-white
}
</style>
