<template>
  <div class="flex flex-row login">
    <div class="container mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col self-center w-4/5 max-w-xl">
      <label class="block text-grey-darker text-2xl font-bold mb-4">
        Recuperar usuario
      </label>
      <form>
        <div class="form-group">
          <label class="block text-grey-darker text-sm font-medium mb-2" for="username">
            Usuario
          </label>
          <input id="username" type="text" v-model="state.user.username" :class="{ 'border-red-500': v$.user.username.$error }"
                 class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" minlength="3" maxlength="25" required>
          <p v-if="v$.user.username.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.user.username.$errors[0].$message}}</p>
        </div>

        <div class="mt-4">
          <label class="block text-grey-darker text-sm font-medium mb-2" for="recoveryPhrase">
            Frase de recuperación
          </label>
          <input id="recoveryPhrase" type="password" v-model="state.user.recoveryPhrase" :class="{ 'border-red-500': v$.user.recoveryPhrase.$error }"
                 class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" required>
          <p v-if="v$.user.recoveryPhrase.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.user.recoveryPhrase.$errors[0].$message}}</p>
        </div>

        <div class="mt-4">
          <label class="block text-grey-darker text-sm font-medium mb-2" for="password">
            Nueva contraseña
          </label>
          <div class="input-wrapper">
            <input id="password" :type="showPassword ? 'text' : 'password'" v-model="state.user.password" :class="{ 'border-red-500': v$.user.password.$error }"
                   class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" minlength="8" maxlength="64" required>
            <!-- Ojo para mostrar contraseña -->
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">
              <fa icon="eye" v-if="showPassword" class="text-sm"/>
              <fa icon="eye-slash" v-else class="text-sm"/>
            </button>
          </div>
          <p v-if="v$.user.password.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.user.password.$errors[0].$message}}</p>

          <!-- Barra de fortaleza de contraseña -->
          <div v-if="state.user.password" class="strength-indicator">
            <div class="strength-bar">
              <div
                  class="strength-fill"
                  :style="{
                    width: (passwordStrength.level / 5 * 100) + '%',
                    backgroundColor: strengthColor
                  }"
              />
            </div>
            <span :style="{ color: strengthColor }">{{ passwordStrength.label }}</span>
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-grey-darker text-sm font-medium mb-2" for="confirmPassword">
            Confirmar contraseña
          </label>
          <div class="input-wrapper">
            <input id="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" v-model="state.user.confirmPassword" :class="{ 'border-red-500': v$.user.confirmPassword.$error }"
                   class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" required>
            <!-- Ojo para mostrar contraseña -->
            <button type="button" class="eye-btn" @click="showConfirmPassword = !showConfirmPassword">
              <fa icon="eye" v-if="showConfirmPassword" class="text-sm"/>
              <fa icon="eye-slash" v-else class="text-sm"/>
            </button>
          </div>
          <p v-if="v$.user.confirmPassword.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.user.confirmPassword.$errors[0].$message}}</p>
        </div>

        <div class="mt-6">
          <button type="button" @click="signIn" :disabled="!state.user.username || !state.user.password || !state.user.confirmPassword || !state.user.recoveryPhrase"
                  class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-500 hover:bg-blue-600
                  disabled:opacity-75 disabled:hover:bg-blue-500">
            Recuperar
          </button>
          <p v-if="state.errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{state.errorMessage}}</p>
        </div>

        <div class="mt-2">
          <button type="button" @click="router.push('/login')"
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
import {required, helpers, minLength, maxLength} from '@vuelidate/validators'
import {reactive, computed, ref} from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '../services/auth.service';
import Swal from 'sweetalert2'
import {strongPassword, getPasswordStrength, strengthColors} from '@/utils/passwordValidator'

export default {
  name: 'RecoverUser',
  setup () {
    const router = useRouter()

    const state = reactive({
      user: {
        username: '',
        password: '',
        confirmPassword: '',
        recoveryPhrase: '',
      },
      errorMessage: '',
    })

    const rules = computed(() => {
      return{
        user: {
          username: { required: helpers.withMessage('El nombre de usuario es requerido', required) },
          password: {
            required: helpers.withMessage('La contraseña es requerida', required),
            minLength: helpers.withMessage('La contraseña debe tener mínimo 8 caracteres', minLength(8)),
            maxLength: helpers.withMessage('La contraseña debe tener máximo 64 caracteres', maxLength(64)),
            strongPassword: helpers.withMessage(
                'La contraseña debe tener +8 caracteres con mayúsculas, minúsculas y números — o bien +12 caracteres libres',
                strongPassword
            ),
          },
          confirmPassword: {
            required: helpers.withMessage('Ingresa una contraseña', required),
            sameAs: helpers.withMessage(
                'Las contraseñas deben coincidir',
                (value) => value === state.user.password
            ),
          },
          recoveryPhrase: { required: helpers.withMessage('La frase de recuperación es requerida', required) },
        }
      }
    })

    // Fortaleza de contraseña
    const passwordStrength = computed(() => getPasswordStrength(state.user.password))
    const strengthColor = computed(() => strengthColors[passwordStrength.value.level])

    const showPassword = ref(false)
    const showConfirmPassword = ref(false)

    const v$ = useVuelidate(rules, state)

    const signIn = async () => {
      v$.value.$validate()
      if (v$.value.$error) return

      const user = {
        username: state.user.username,
        recoveryPhrase: state.user.recoveryPhrase,
        newPassword: state.user.password,
      }

      try {
        await AuthService.recoverUser(user)
        await Swal.fire({
          title: '¡Recuperación exitosa!',
          html: `
            <p style="color:#6b7280; margin-bottom:16px;">
              Ahora puedes volver a iniciar sesión con tu nueva contraseña
            </p>
          `,
          icon: 'success',
          confirmButtonText: 'Aceptar',
        })
        router.push("/login")
      } catch (error) {
        state.errorMessage =
            (error.response?.data?.body?.message) ||
            error.message ||
            error.toString()
      }
    }

    return {
      state,
      v$,
      passwordStrength,
      strengthColor,
      showPassword,
      showConfirmPassword,
      signIn,
      router,
    }
  },
}
</script>

<style scoped>
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

.strength-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease, background-color 0.3s ease;
}
</style>