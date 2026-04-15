<template>
  <div class="home flex justify-center">
    <div class="grid md:grid-cols-3">
      <div class="text-center self-center md:col-span-2">
        <p class="text-5xl md:text-7xl text-white">Money app</p>
        <p class="text-3xl md:text-5xl text-white p-10">Lleva registro de tus gastos</p>
        <p class="text-xl md:text-3xl text-white">Toma decisiones basadas en datos</p>
      </div>
      <div class="md:self-center">
        <img src="../assets/money.gif" alt="money" class="money" />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Home',
  setup() {
    const store = useStore()
    const router = useRouter()

    const loggedIn = computed(() => {
      return store.state.auth.status.loggedIn
    })

    onMounted(() => {
      if (loggedIn.value) {
        router.push("/dashboard")
      }
    })

    return {
      loggedIn
    }
  }
}
</script>

<style>
  .money {
    max-width: 200px;
    margin-left: auto;
    margin-right: auto;
  }
</style>