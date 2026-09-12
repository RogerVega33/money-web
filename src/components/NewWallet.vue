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
            <input :disabled="isSaving" id="name" type="text" v-model="state.newWallet.name" maxlength="50"
                   class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" required>
            <p v-if="v$.newWallet.name.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.newWallet.name.$errors[0].$message}}</p>
          </div>
          <div class="mt-4">
            <label class="block text-grey-darker text-sm font-medium mb-2" for="detail">
              Descripción
            </label>
            <input :disabled="isSaving" id="detail" type="text" v-model="state.newWallet.detail" placeholder="Opcional" maxlength="150"
                   class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker">
            <p v-if="v$.newWallet.detail.$error" class="text-red-500 text-xs mt-2">{{v$.newWallet.detail.$errors[0].$message}}</p>
          </div>
          <div class="mt-4" v-if="state.newWallet.type !== 'crypto'">
            <label class="block text-grey-darker text-sm font-medium mb-2" for="startingAmount">
              Monto inicial
            </label>
            <input :disabled="isSaving" id="startingAmount" type="text" inputmode="decimal" maxlength="13"
                @keydown="blockInvalidChars"
                @beforeinput="blockInvalidAmountInput"
                @paste="handleAmountPaste"
                @drop.prevent v-model="state.newWallet.startingAmount" placeholder="$ 0.00"
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
          <div class="mt-4">
            <label for="newWalletExclude" class="relative inline-flex items-center mb-4 cursor-pointer">
              <input type="checkbox" id="newWalletExclude" class="sr-only peer" v-model="state.newWallet.excludeFromTotal" :disabled="isSaving">
              <div class="relative shrink-0 w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Excluir del total</span>
            </label>
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
import { blockInvalidChars, blockInvalidAmountInput, handleAmountPaste } from '@/utils/inputValidation'
import { amountError, textError } from '@/utils/dataValidation'
import LoadingDots from '@/components/common/LoadingDots.vue'
import { reactive, computed, ref } from 'vue'
import { required, helpers } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import WalletService from "../services/wallet.service";

export default {
  name: 'NewWallet',
  components: { LoadingDots },
  setup(props, { emit }) {
    const state = reactive({
      newWallet: {
        type: 'fiat',
        excludeFromTotal: false
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
        name: { valid: helpers.withMessage(() => textError(state.newWallet.name), value => !textError(value)) },
        detail: { valid: helpers.withMessage(() => textError(state.newWallet.detail, 'El detalle', 150, true), value => !textError(value, 'El detalle', 150, true)) },
        startingAmount: {
          valid: helpers.withMessage(() => amountError(state.newWallet.startingAmount || '0', false, true), value => state.newWallet.type === 'crypto' || !amountError(value || '0', false, true)),
        },
        type: { required: helpers.withMessage('Seleccione un tipo de billetera', required), valid: helpers.withMessage('Tipo de billetera no válido', value => ['fiat', 'crypto'].includes(value)) },
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
        payload.name = payload.name.trim();
        payload.startingAmount = payload.type === 'crypto' ? '0' : (payload.startingAmount || '0');
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
      blockInvalidChars,
      blockInvalidAmountInput,
      handleAmountPaste,
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