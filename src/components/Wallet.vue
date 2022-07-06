<template>
  <div class="wallet">
    <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">Billeteras</h5>
        <fa :icon="showIconNewWallet? 'plus':'xmark'"
            class="cursor-pointer"
            :class="showIconNewWallet? 'text-green-600':'text-red-600'" @click="addWallet"/>
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
                {{wallet.total}} $
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

export default {
  name: 'Wallet',
  props: {
    wallets: Array,
    showFormNewWallet: Boolean,
  },
  setup(props) {
    const selectedWallet = ref({});
    const showIconNewWallet = ref(!props.showFormNewWallet);
    return {
      selectedWallet,
      showIconNewWallet
    }
  },
  methods: {
    selectWallet(wallet){
      this.selectedWallet = wallet;
      this.$emit('select-wallet', wallet);
    },
    addWallet(){
      this.showIconNewWallet = !this.showIconNewWallet;
      this.$emit('add-wallet', !this.showIconNewWallet);
    }
  },
  watch: {
    showFormNewWallet(newValue){
      this.showIconNewWallet = !newValue;
    },
  },
}
</script>