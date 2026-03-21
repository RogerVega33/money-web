<template>
  <div class="flex flex-row login">
    <div class="container mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col self-center w-4/5 max-w-xl">
      <form>
        <div class="form-group">
          <label class="block text-grey-darker text-sm font-medium mb-2" for="username">
            Usuario
          </label>
          <input id="username" type="text" v-model="state.user.username" :class="{ 'border-red-500': v$.user.username.$error }"
                 class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" required>
          <p v-if="v$.user.username.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.user.username.$errors[0].$message}}</p>
        </div>
        <div class="mt-4">
          <label class="block text-grey-darker text-sm font-medium mb-2" for="password">
            Contraseña
          </label>
          <input id="password" type="password" v-model="state.user.password" :class="{ 'border-red-500': v$.user.password.$error }"
                 class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" required>
          <p v-if="v$.user.password.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.user.password.$errors[0].$message}}</p>
        </div>
        <div class="mt-4">
          <label for="checked-toggle" class="relative inline-flex items-center mb-4 cursor-pointer">
            <input type="checkbox" value="" id="checked-toggle" class="sr-only peer" v-model="state.hideMoney">
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Ocultar dinero al iniciar sesión</span>
          </label>
        </div>
        <div class="mt-6">
          <button type="button" @click="login" :disabled="!state.user.username || !state.user.password"
                  class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-600 hover:bg-blue-500
                  disabled:opacity-75 disabled:hover:bg-blue-300">
            Iniciar sesión
          </button>
          <p v-if="state.errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{state.errorMessage}}</p>
        </div>
        <div class="mt-6">
          <button type="button" @click="$router.push('/newUser')"
                  class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-600 hover:bg-blue-500">
            Registrarse
          </button>
        </div>
        <div class="mt-2">
          <button type="button" @click="$router.push('/newUser')"
                  class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-600 hover:bg-blue-500">
            Recuperar usuario
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

<script>
import useVuelidate from '@vuelidate/core'
import {required, helpers} from '@vuelidate/validators'
import {reactive, computed} from 'vue'

export default {
  name: 'Login',
  setup () {
    const state = reactive({
      user: {
        username: '',
        password: ''
      },
      errorMessage: '',
      hideMoney: false,
    })
    const rules = computed(() => {
      return{
        user: {
          username: { required: helpers.withMessage('Ingrese un usuario', required) },
          password: { required: helpers.withMessage('Ingrese la contraseña', required) }
        }
      }
    })
    const v$ = useVuelidate(rules, state)
    return { state, v$ }
  },
  methods: {
    async login() {
      this.v$.$validate()
      if(this.v$.$error){
        console.log("Error")
      }else{
        this.$store.dispatch("auth/login", this.state.user).then(
          () => {
            this.$store.commit('app/SET_HIDE_MONEY', this.state.hideMoney)
            this.$router.push("/dashboard")
          },
          (error) => {
            this.state.errorMessage =
                    (error.response &&
                            error.response.data &&
                            error.response.data.body?.message) ||
                    error.message ||
                    error.toString()
          }
        );

      }
    }
  },
}
</script>