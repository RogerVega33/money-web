<template>
  <div>
    <Menu :loggedIn="loggedIn"/>
    <div>
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="sessionKey"
                   v-if="route.name !== 'Dashboard' || loggedIn" />
      </router-view>
    </div>
  </div>
  <!--fa :icon="['fab', 'youtube']" /-->
</template>

<script>
import './assets/tailwind.css'
import { computed, onMounted, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Menu from './components/Menu.vue'
import { useSessionSync } from './composables/useSessionSync'

export default {
  name: 'App',
  components: {
    Menu
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
