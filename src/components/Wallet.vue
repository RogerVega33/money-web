<template>
  <div class="wallet">
    <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">Billeteras</h5>
        <div>
          <fa icon="plus" v-if="!showForm"
              class="cursor-pointer text-green-600" @click="addWallet"/>
          <fa icon="gear" v-if="selectedWallet.id && !showForm" @click="editWallet"
              class="cursor-pointer text-gray-600 pl-2"
          />
          <fa icon="xmark" v-if="showForm" @click="hideForms"
              class="cursor-pointer text-red-600"
          />
        </div>
      </div>
      <div class="flow-root">
        <ul role="list" class="divide-y divide-gray-200" v-if="wallets.length > 0">
          <li class="py-3 sm:py-4" v-for="wallet in wallets" :key="wallet.id">
            <div @click="selectWallet(wallet)"
                 :class="{ 'text-blue-700': selectedWallet.id === wallet.id }"
                 class="flex items-center space-x-4 text-gray-900 hover:text-blue-500 cursor-pointer">
              <div class="flex-shrink-0">
                <fa icon="sack-dollar" class="text-green-600 h-8" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm truncate" :class="selectedWallet.id === wallet.id? 'font-bold':'font-medium'">
                  {{wallet.name}}
                </p>
              </div>
              <div class="inline-flex items-center text-base font-semibold">
                {{formatCurrency(wallet.total)}}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { formatCurrency } from '../utils/formats';

export default {
  name: 'Wallet',
  props: {
    wallets: Array,
    showFormNewWallet: Boolean,
    showFormEditWallet: Boolean,
  },
  setup() {
    const selectedWallet = ref({});
    return {
      selectedWallet,
    }
  },
  methods: {
    selectWallet(wallet){
      this.selectedWallet = wallet;
      this.$emit('select-wallet', wallet);
    },
    addWallet(){
      this.$emit('add-wallet');
    },
    editWallet(){
      this.$emit('edit-wallet');
    },
    hideForms(){
      this.$emit('hide-forms');
    }
  },
  computed: {
    showForm(){
        return this.showFormNewWallet || this.showFormEditWallet;
    },
    formatCurrency() {
        return formatCurrency;
    }
  },
}
</script>