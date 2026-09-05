<template>
  <div class="new-wallet">
    <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">Agregar billetera</h5>
      </div>
      <div class="">
        <form :aria-busy="isSaving" @submit.prevent="saveWallet">
          <div class="form-group">
            <label class="block text-grey-darker text-sm font-medium mb-2" for="name">
              Nombre
            </label>
            <input :disabled="isSaving" id="name" type="text" v-model="state.newWallet.name" maxlength="25"
                   class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" required>
            <p v-if="v$.newWallet.name.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.newWallet.name.$errors[0].$message}}</p>
          </div>
          <div class="mt-4">
            <label class="block text-grey-darker text-sm font-medium mb-2" for="detail">
              Descripción
            </label>
            <input :disabled="isSaving" id="detail" type="text" v-model="state.newWallet.detail" placeholder="Opcional" max="50"
                   class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" required>
          </div>
          <div class="mt-4" v-if="state.newWallet.type !== 'crypto'">
            <label class="block text-grey-darker text-sm font-medium mb-2" for="startingAmount">
              Monto inicial
            </label>
            <input :disabled="isSaving" id="startingAmount" type="number" min="0.00" max="1000000.00" step="0.01" v-model="state.newWallet.startingAmount" placeholder="$ 0.00"
                   class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker">
            <p v-if="v$.newWallet.startingAmount.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.newWallet.startingAmount.$errors[0].$message}}</p>
          </div>
          <div class="mt-4">
            <label class="block text-grey-darker text-sm font-medium mb-2" for="startingAmount">
              Tipo
            </label>
            <Multiselect :disabled="isSaving" v-model="state.newWallet.type"
                         valueProp="value"
                         :searchable="false"
                         :options="walletTypes"
                         label="name">
            </Multiselect>
            <p v-if="v$.newWallet.type.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.newWallet.type.$errors[0].$message}}</p>
          </div>
          <div class="mt-6">
            <p v-if="state.errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{state.errorMessage}}</p>
            <button :disabled="isSaving" type="button" @click="saveWallet"
                    class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:bg-blue-500">
              <template v-if="isSaving">Guardando<LoadingDots /></template>
              <template v-else>Guardar</template>
            </button>
            <button :disabled="isSaving" type="button" @click="cancel" class="mt-5 text-white font-bold py-2 px-4 rounded-lg w-full bg-gray-500 hover:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:bg-gray-500">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingDots from '@/components/common/LoadingDots.vue'
import { reactive, computed, ref } from 'vue'
import { required, helpers, minValue, maxValue } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import WalletService from "../services/wallet.service";

export default {
  name: 'NewWallet',
  components: { LoadingDots },
  setup(props, { emit }) {
    const state = reactive({
      newWallet: {
        type: 'fiat'
      },
      errorMessage: '',
    });

    const isSaving = ref(false);

    const walletTypes = ref([
      { name: "Fiat", value: "fiat" },
      { name: "Cripto", value: "crypto" }
    ]);

    const rules = computed(() => ({
      newWallet: {
        name: { required: helpers.withMessage('Ingrese un nombre para la billetera', required) },
        startingAmount: {
          minValueValue: helpers.withMessage('Valor mínimo 0.00', minValue(0)),
          maxValueValue: helpers.withMessage('Valor máximo 1 000 000.00', maxValue(1000000)),
        },
        type: { required: helpers.withMessage('Seleccione una categoría', required) },
      },
    }));

    const v$ = useVuelidate(rules, state);

    const saveWallet = async () => {
      if (isSaving.value) return;
      isSaving.value = true;
      state.errorMessage = '';

      try {
        const valid = await v$.value.$validate();
        if (!valid) return;

        const payload = { ...state.newWallet };
        if (payload.startingAmount) {
          payload.startingAmount = +Number(payload.startingAmount).toFixed(2);
        }
        await WalletService.saveWallet(payload);
        emit('success', true);
      } catch (error) {
        state.errorMessage = error.response?.data?.body?.message ||
            error.message ||
            error.toString();
      } finally {
        isSaving.value = false;
      }
    };

    const cancel = () => {
      if (isSaving.value) return;
      state.newWallet = {};
      v$.value.$reset();
      emit('success', false);
    };

    return {
      isSaving,
      state,
      walletTypes,
      v$,
      saveWallet,
      cancel,
    }
  },
}
</script>