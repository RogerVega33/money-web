<template>
  <div id="menu" class="bg-green-800 p-2">
    <nav class="container mx-auto">
      <div class="flex items-center justify-between text-white p-1 lg:px-5">
        <router-link to="/" class="shrink-0 whitespace-nowrap">
          <fa icon="sack-dollar" class="text-green-300" /> <span class="hover:text-cyan-300">Money App</span>
        </router-link>
        <div class="shrink-0 text-white">
          <ul class="flex flex-row space-x-8 cursor-pointer">
            <li v-if="!loggedIn" class="hover:text-cyan-300">
              <router-link to="/login">Login</router-link>
            </li>
            <li v-else class="hover:text-cyan-300" @click.prevent="logOut">
              <span>Logout</span>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'AppMenu',
  props: {
    loggedIn: Boolean
  },
  setup() {
    const router = useRouter()
    const store = useStore()

    const logOut = () => {
      store.dispatch('auth/logout')
      router.push('/')
    }

    return {
      logOut
    }
  },
}
</script>
