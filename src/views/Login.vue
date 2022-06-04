<template>
  <div class="flex flex-row h-screen">
    <div class="container mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col self-center w-4/5 max-w-xl">
      <form>
        <div class="form-group">
          <label class="block text-grey-darker text-sm font-medium mb-2" for="username">
            Usuario
          </label>
          <input id="username" type="text" v-model="state.user.username" :class="{ 'border-red-500': v$.user.username.$error }"
                 class="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker" required>
          <p v-if="v$.user.username.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.user.username.$errors[0].$message}}</p>
        </div>
        <div class="mt-4">
          <label class="block text-grey-darker text-sm font-medium mb-2" for="password">
            Contraseña
          </label>
          <input id="password" type="password" v-model="state.user.password" :class="{ 'border-red-500': v$.user.password.$error }"
                 class="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker" required>
          <p v-if="v$.user.password.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.user.password.$errors[0].$message}}</p>
        </div>
        <div class="mt-6">
          <button type="button" @click="login" :disabled="!state.user.username || !state.user.username"
                  class="text-white font-bold py-2 px-4 rounded w-full"
                  :class="{'bg-blue-400': !state.user.username || !state.user.password,
                  'bg-blue-500 hover:bg-blue-600': state.user.username && state.user.password}">
            Log In
          </button>
          <p v-if="state.errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{state.errorMessage}}</p>
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
      errorMessage: ''
    })
    const rules = computed(() => {
      return{
        user: {
          username: { required: helpers.withMessage('WTF!', required) },
          password: { required: helpers.withMessage('WTF!', required) }
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