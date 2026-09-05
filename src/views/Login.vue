<template>
  <div class="flex flex-row login">
    <div class="container mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col self-center w-4/5 max-w-xl">
      <label class="block text-grey-darker text-2xl font-bold mb-4">
        Iniciar sesión
      </label>
      <form :aria-busy="isSubmitting" @submit.prevent>
        <div class="form-group">
          <label class="block text-grey-darker text-sm font-medium mb-2" for="username">
            Usuario
          </label>
          <input :disabled="isSubmitting" id="username" type="text" v-model="state.user.username" :class="{ 'border-red-500': v$.user.username.$error }"
                 class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" required>
          <p v-if="v$.user.username.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.user.username.$errors[0].$message}}</p>
        </div>
        <div class="mt-4">
          <label class="block text-grey-darker text-sm font-medium mb-2" for="password">
            Contraseña
          </label>
          <div class="input-wrapper">
            <input :disabled="isSubmitting" id="password" :type="showPassword ? 'text' : 'password'" v-model="state.user.password" :class="{ 'border-red-500': v$.user.password.$error }"
                   class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" required>
            <!-- Ojo para mostrar contraseña -->
            <button :disabled="isSubmitting" type="button" class="eye-btn" @click="showPassword = !showPassword">
              <fa icon="eye" v-if="showPassword" class="text-sm"/>
              <fa icon="eye-slash" v-else class="text-sm"/>
            </button>
          </div>
        </div>
        <div class="mt-4">
          <label for="checked-toggle" class="relative inline-flex items-center mb-4 cursor-pointer">
            <input :disabled="isSubmitting" type="checkbox" value="" id="checked-toggle" class="sr-only peer" v-model="state.hideMoney">
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Ocultar dinero al iniciar sesión</span>
          </label>
        </div>
        <div class="mt-6">
          <button type="button" @click="login" :disabled="isSubmitting || !state.user.username || !state.user.password"
                  class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-600 hover:bg-blue-500
                  disabled:opacity-75 disabled:hover:bg-blue-300">
            {{ isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
          <p v-if="state.errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{state.errorMessage}}</p>
        </div>
        <div class="mt-6">
          <button :disabled="isSubmitting" type="button" @click="$router.push('/newUser')"
                  class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-600 hover:bg-blue-500">
            Registrarse
          </button>
        </div>
        <div class="mt-2">
          <button :disabled="isSubmitting" type="button" @click="$router.push('/recoverUser')"
                  class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-600 hover:bg-blue-500">
            Recuperar usuario
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
import useVuelidate from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { reactive, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const state = reactive({
  user: { username: '', password: '' },
  errorMessage: '',
  hideMoney: false,
})

const rules = computed(() => ({
  user: {
    username: { required: helpers.withMessage('Ingrese un usuario', required) },
    password: { required: helpers.withMessage('Ingrese la contraseña', required) }
  }
}))

const isSubmitting = ref(false)
const showPassword = ref(false)
const v$ = useVuelidate(rules, state)

async function login() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  state.errorMessage = ''

  try {
    await v$.value.$validate()
    if (v$.value.$error) return

    await store.dispatch('auth/login', state.user)
    store.commit('app/SET_HIDE_MONEY', state.hideMoney)
    await router.push('/dashboard')
  } catch (error) {
    state.errorMessage =
        error?.response?.data?.body?.message ||
        error.message ||
        error.toString()
  } finally {
    isSubmitting.value = false
  }
}

</script>

<style scoped>
button:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  width: 100%;
  padding-right: 40px;
}

.eye-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #9ca3af;
  display: flex;
  align-items: center;
}

.eye-btn:hover {
  color: #374151;
}
</style>