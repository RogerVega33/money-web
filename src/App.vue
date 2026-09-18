<template>
  <div class="app-layout">
    <Menu :loggedIn="loggedIn"/>
    <div class="app-content">
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="sessionKey" class="app-page"
                   v-if="route.name !== 'Dashboard' || loggedIn" />
      </router-view>
    </div>
    <AppFooter />
  </div>
  <!--fa :icon="['fab', 'youtube']" /-->
</template>

<script>
import './assets/tailwind.css'
import { computed, onMounted, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Menu from './components/Menu.vue'
import AppFooter from './components/AppFooter.vue'
import { useSessionSync } from './composables/useSessionSync'

export default {
  name: 'App',
  components: {
    Menu,
    AppFooter
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const loggedIn = computed(() => store.state.auth.status.loggedIn)
    const sessionKey = computed(() => store.state.auth.user?.token ?? 'anonymous')
    useSessionSync(store, router)

    onBeforeMount(() => {
      if (loggedIn.value) {
        router.push("/dashboard")
      }
    })

    onMounted(() => {
      store.commit('app/SET_HIDE_MONEY', localStorage.getItem("hideMoney") === "true")
    })

    return {
      loggedIn,
      sessionKey
    }
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
}

.app-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.app-page {
  flex: 1;
  min-width: 0;
}
</style>
