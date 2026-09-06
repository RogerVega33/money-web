<template>
  <div class="flex flex-row login">
    <div class="container mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col self-center w-4/5 max-w-xl">
      <label class="block text-grey-darker text-2xl font-bold mb-4">
        Nuevo usuario
      </label>
      <form :aria-busy="isSubmitting" @submit.prevent>
        <div class="form-group">
          <label class="block text-grey-darker text-sm font-medium mb-2" for="username">
            Usuario
          </label>
          <input :disabled="isSubmitting" id="username" type="text" v-model="state.user.username" :class="{ 'border-red-500': v$.user.username.$error }"
                 class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" minlength="3" maxlength="25" required>
          <p v-if="v$.user.username.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.user.username.$errors[0].$message}}</p>
        </div>
        <div class="mt-4">
          <label class="block text-grey-darker text-sm font-medium mb-2" for="password">
            Contraseña
          </label>
          <div class="input-wrapper">
            <input :disabled="isSubmitting" id="password" :type="showPassword ? 'text' : 'password'" v-model="state.user.password" :class="{ 'border-red-500': v$.user.password.$error }"
                   class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" minlength="8" maxlength="64" required>
            <!-- Ojo para mostrar contraseña -->
            <button :disabled="isSubmitting" type="button" class="eye-btn" @click="showPassword = !showPassword">
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
            <input :disabled="isSubmitting" id="confirmPassword" maxlength="64" :type="showConfirmPassword ? 'text' : 'password'" v-model="state.user.confirmPassword" :class="{ 'border-red-500': v$.user.confirmPassword.$error }"
                   class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" required>
            <!-- Ojo para mostrar contraseña -->
            <button :disabled="isSubmitting" type="button" class="eye-btn" @click="showConfirmPassword = !showConfirmPassword">
              <fa icon="eye" v-if="showConfirmPassword" class="text-sm"/>
              <fa icon="eye-slash" v-else class="text-sm"/>
            </button>
          </div>
          <p v-if="v$.user.confirmPassword.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.user.confirmPassword.$errors[0].$message}}</p>
        </div>
        <div class="mt-6">
          <button type="button" @click="signIn" :disabled="isSubmitting || !state.user.username || !state.user.password || !state.user.confirmPassword"
                  class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-500 hover:bg-blue-600
                  disabled:opacity-75 disabled:hover:bg-blue-500">
            <template v-if="isSubmitting">Guardando<LoadingDots /></template>
            <template v-else>Registrarse</template>
          </button>
          <p v-if="state.errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{state.errorMessage}}</p>
        </div>
        <div class="mt-2">
          <button :disabled="isSubmitting" type="button" @click="$router.push('/login')"
                  class="text-white font-bold py-2 px-4 rounded-lg w-full bg-gray-500 hover:bg-gray-600">
            Cancelar
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
import LoadingDots from '@/components/common/LoadingDots.vue'
import useVuelidate from '@vuelidate/core'
import { required, helpers, minLength, maxLength } from '@vuelidate/validators'
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'
import Swal from 'sweetalert2'
import { strongPassword, getPasswordStrength, strengthColors } from '@/utils/passwordValidator'

const router = useRouter()

const onlyAlphanumeric = helpers.regex(/^[a-zA-Z0-9]+$/)

const state = reactive({
  user: { username: '', password: '', confirmPassword: '' },
  errorMessage: '',
})

const rules = computed(() => ({
  user: {
    username: {
      required: helpers.withMessage('El nombre de usuario es requerido', required),
      minLength: helpers.withMessage('El nombre de usuario debe tener mínimo 3 caracteres', minLength(3)),
      maxLength: helpers.withMessage('El nombre de usuario debe tener máximo 25 caracteres', maxLength(25)),
      onlyAlphanumeric: helpers.withMessage('El nombre de usuario solo puede tener letras y números', onlyAlphanumeric),
    },
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
  },
}))

const isSubmitting = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const v$ = useVuelidate(rules, state)

const passwordStrength = computed(() => getPasswordStrength(state.user.password))
const strengthColor = computed(() => strengthColors[passwordStrength.value.level])

async function signIn() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  state.errorMessage = ''

  try {
    await v$.value.$validate()
    if (v$.value.$error) return

    const response = await AuthService.createUser({
      username: state.user.username,
      password: state.user.password,
    })
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
      allowOutsideClick: false, // obliga al usuario a hacer clic en el botón
      allowEscapeKey: false, // no puede cerrar con ESC
    })

    await router.push('/login')  // redirige solo después de que el usuario confirme
  } catch (error) {
    state.errorMessage =
        error.response?.data?.body?.message ||
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