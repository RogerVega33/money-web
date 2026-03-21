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
          <label class="block text-grey-darker text-sm font-medium mb-2" for="password">
            Confirmar contraseña
          </label>
          <input id="confirmPassword" type="password" v-model="state.user.confirmPassword" :class="{ 'border-red-500': v$.user.confirmPassword.$error }"
                 class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" required>
          <p v-if="v$.user.confirmPassword.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.user.confirmPassword.$errors[0].$message}}</p>
        </div>
        <div class="mt-6">
          <button type="button" @click="signIn" :disabled="!state.user.username || !state.user.password || !state.user.confirmPassword"
                  class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-500 hover:bg-blue-600
                  disabled:opacity-75 disabled:hover:bg-blue-500">
            Registrarse
          </button>
          <p v-if="state.errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{state.errorMessage}}</p>
        </div>
        <div class="mt-2">
          <button type="button" @click="$router.push('/login')"
                  class="text-white font-bold py-2 px-4 rounded-lg w-full bg-gray-500 hover:bg-gray-600">
            Cancelar
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

<script>
import useVuelidate from '@vuelidate/core'
import {required, helpers, sameAs} from '@vuelidate/validators'
import {reactive, computed} from 'vue'
import AuthService from '../services/auth.service';
import Swal from 'sweetalert2'

export default {
  name: 'NewUser',
  setup () {
    const state = reactive({
      user: {
        username: '',
        password: '',
        confirmPassword: '',
      },
      errorMessage: '',
    })
    const rules = computed(() => {
      return{
        user: {
          username: { required: helpers.withMessage('El usuario es requerido', required) },
          password: { required: helpers.withMessage('La contraseña es requerida', required) },
          confirmPassword: {
            required: helpers.withMessage('Ingresa una contraseña', required),
            sameAs: helpers.withMessage('Las contraseñas deben coincidir', sameAs(state.user.password))
          },
        }
      }
    })
    const v$ = useVuelidate(rules, state)
    return { state, v$ }
  },
  methods: {
    async signIn() {
      this.v$.$validate()
      if (this.v$.$error) return
      const newUser = {
        username: this.state.user.username,
        password: this.state.user.password,
      }
      try {
        const response = await AuthService.createUser(newUser)
        const recoveryPhrase = response.recoveryPhrase;

        await Swal.fire({
          title: '¡Usuario creado exitosamente!',
          html: `
            <p style="color:#6b7280; margin-bottom:16px;">
              Antes de continuar, guarda tu frase de recuperación. La necesitarás para recuperar tu cuenta en caso de que olvides tu contraseña
            </p>
            <p style="color:#b45309; font-size:0.8em; text-transform:uppercase; font-weight:600; margin-bottom:8px;">
                ⚠️ Solo aparecerá esta vez ⚠️
            </p>
            <div style="background:#fffbeb; border:1px solid #f59e0b; border-radius:10px; padding:14px; margin-top:15px; margin-bottom:15px;">
              <p style="color:#92400e; font-size:0.95em; font-weight:bold; letter-spacing:1px; margin:0; word-break: keep-all;">
                ${recoveryPhrase}
              </p>
            </div>
            <p style="color:#9ca3af; font-size:0.8em; margin:0;">
              Asegúrate de anotar las palabras en orden
            </p>
          `,
          icon: 'success',
          confirmButtonText: 'Ya la guardé',
          allowOutsideClick: false,  // obliga al usuario a hacer clic en el botón
          allowEscapeKey: false,     // no puede cerrar con ESC
        })
        this.$router.push("/login")  // redirige solo después de que el usuario confirme
      } catch (error) {
        this.state.errorMessage =
            (error.response?.data?.body?.message) ||
            error.message ||
            error.toString()
      }
    }
  },
}
</script>