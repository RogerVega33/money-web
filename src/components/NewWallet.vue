<template>
  <div class="new-wallet">
    <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">Agregar billetera</h5>
      </div>
      <div class="">
        <form>
          <div class="form-group">
            <label class="block text-grey-darker text-sm font-medium mb-2" for="name">
              Nombre
            </label>
            <input id="name" type="text" v-model="state.newWallet.name" maxlength="25"
                   class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" required>
            <p v-if="v$.newWallet.name.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.newWallet.name.$errors[0].$message}}</p>
          </div>
          <div class="mt-4">
            <label class="block text-grey-darker text-sm font-medium mb-2" for="detail">
              Descripción
            </label>
            <input id="detail" type="text" v-model="state.newWallet.detail" placeholder="Opcional" max="50"
                   class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker" required>
          </div>
          <div class="mt-4" v-if="state.newWallet.type !== 'crypto'">
            <label class="block text-grey-darker text-sm font-medium mb-2" for="startingAmount">
              Monto inicial
            </label>
            <input id="startingAmount" type="number" min="0.00" max="1000000.00" step="0.01" v-model="state.newWallet.startingAmount" placeholder="$ 0.00"
                   class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker">
            <p v-if="v$.newWallet.startingAmount.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.newWallet.startingAmount.$errors[0].$message}}</p>
          </div>
          <div class="mt-4">
            <label class="block text-grey-darker text-sm font-medium mb-2" for="startingAmount">
              Tipo
            </label>
            <Multiselect v-model="state.newWallet.type"
                         valueProp="value"
                         :searchable="false"
                         :options="walletTypes"
                         label="name">
            </Multiselect>
            <p v-if="v$.newWallet.type.$error" class="text-red-500 text-xs italic mt-2 mb-2">{{v$.newWallet.type.$errors[0].$message}}</p>
          </div>
          <div class="mt-6">
            <p v-if="state.errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{state.errorMessage}}</p>
            <button type="button" @click="saveWallet"
                    class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-500 hover:bg-blue-600">
              Guardar
            </button>
            <button type="button" @click="cancel" class="mt-5 text-white font-bold py-2 px-4 rounded-lg w-full bg-gray-500 hover:bg-gray-600">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import {reactive, computed, ref} from 'vue'
import {required, helpers, minValue, maxValue} from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import WalletService from "../services/wallet.service";

export default {
  name: 'NewWallet',
  setup() {
    const state = reactive({
      newWallet: {
        type: 'fiat'
      },
      errorMessage: '',
    });
    const walletTypes = ref([{
        name: "Fiat",
        value: "fiat"
      }, {
        name: "Cripto",
        value: "crypto"
    }]);
    const rules = computed(() => {
      return{
        newWallet: {
          name: { required: helpers.withMessage('Ingrese un nombre para la billetera', required) },
          startingAmount: {
            minValueValue: helpers.withMessage('Valor mínimo 0.00', minValue(0)),
            maxValueValue: helpers.withMessage('Valor máximo 1 000 000.00', maxValue(1000000)),
          },
          type: { required: helpers.withMessage('Seleccione una categoría', required) },
        },
      }
    });
    const v$ = useVuelidate(rules, state)
    return {
      state,
      walletTypes,
      v$,
    }
  },
  methods: {
    async saveWallet(){
      if(this.state.newWallet.startingAmount) this.state.newWallet.startingAmount = +(this.state.newWallet.startingAmount.toFixed(2));
      this.v$.$validate()
      if(this.v$.$error){
        console.log("Error")
      }else{
        WalletService.saveWallet(this.state.newWallet).then(() => {
            this.$emit('success', true);
          }
        ).catch((error) => {
          this.state.errorMessage = (error.response &&
            error.response.data &&
            error.response.data.body?.message) ||
            error.message ||
            error.toString()
        })
      }
    },
    cancel(){
      this.state.newWallet = {};
      this.v$.$reset();
      this.$emit('success', false);
    }
  },
}
</script>