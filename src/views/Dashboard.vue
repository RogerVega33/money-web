<template>
  <div class="container mx-auto flex flex-col lg:flex-row">
    <div class="lg:basis-1/3">
      <div class="flex flex-col w-full">
        <div class="w-full">
          <div class="card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
            <div class="flex justify-between items-center mb-4">
              <h5 class="text-xl font-bold leading-none text-gray-900">Billeteras</h5>
            </div>
            <div class="flow-root">
              <ul role="list" class="divide-y divide-gray-200">
                <li class="py-3 sm:py-4" v-for="wallet in wallets" :key="wallet.id">
                  <div @click="selectWallet(wallet)"
                       :class="{ 'text-blue-700': selectedWallet.id === wallet.id }"
                       class="flex items-center space-x-4 text-gray-900 hover:text-blue-500 cursor-pointer">
                    <div class="flex-shrink-0">
                      <fa icon="sack-dollar" class="text-green-700 h-8" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate">
                        {{wallet.name}}
                      </p>
                      <p class="text-sm truncate" v-if="currentUser">
                        {{currentUser.name}}
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

        <div class="w-full">
          <div class="mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
            <div class="flex justify-between items-center mb-4">
              <h5 class="text-xl font-bold leading-none text-gray-900">Configuración</h5>
            </div>
            <div class="flow-root">
              <label>Fecha</label>
              <Datepicker v-model="month" monthPicker autoApply />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:basis-1/3">
      <div class="card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
        <div class="flex justify-between items-center mb-4">
          <h5 class="text-xl font-bold leading-none text-gray-900">Transacciones</h5>
        </div>
        <div class="flow-root">
          <ul role="list" class="divide-y divide-gray-200">
            <li class="py-3 sm:py-4" v-for="transaction in transactions.transactions" :key="transaction.id">
              <div
                   class="flex items-center space-x-4 text-gray-900 hover:text-blue-600 cursor-pointer">
                <div class="flex-shrink-0">
                  <fa icon="sack-dollar" class="text-green-700 h-8" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">
                    {{transaction.categoryName}}
                  </p>
                  <p class="text-sm truncate">
                    {{transaction.detail}}
                  </p>
                </div>
                <div class="inline-flex items-center text-base font-semibold" :class="transaction.type === 'expense'?'text-red-500':'text-green-500'">
                  {{transaction.type === 'expense'? '-' : '+'}}{{transaction.amount}} $
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="lg:basis-1/3">
      <div class="card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
        <div class="flex justify-between items-center mb-4">
          <h5 class="text-xl font-bold leading-none text-gray-900">Resumen</h5>
        </div>
        <div class="flow-root">
          <div class="flex space-x-4 text-gray-900">
            <div class="font-medium w-full">
              <div class="flex flex-row">
                <div class="basis-1/2">
                  Ingresos
                </div>
                <div class="basis-1/2 text-right">
                  {{transactions.totalIncome || '0.0'}} $
                </div>
              </div>
              <div class="flex flex-row">
                <div class="basis-1/2">
                  Gastos
                </div>
                <div class="basis-1/2 text-right">
                  {{transactions.totalExpense || '0.0'}} $
                </div>
              </div>
              <hr/>
              <div class="flex flex-row">
                <div class="basis-1/2">
                  Ahorro
                </div>
                <div class="basis-1/2 text-right">
                  {{transactions.savings || '0.0'}} $
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
<script>
import WalletService from "../services/wallet.service";
import TransactionService from "../services/transaction.service";
import { ref } from 'vue';

export default {
  name: 'Dashboard',
  setup() {
    const month = ref({
      month: new Date().getMonth(),
      year: new Date().getFullYear()
    });

    return {
      month,
    }
  },
  data() {
    return {
      wallets: [],
      transactions: [],
      selectedWallet: {},
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
  methods: {
    selectWallet(wallet){
      this.selectedWallet = wallet;
      this.getTransactions(this.selectedWallet.id, this.month.year, this.month.month+1)
    },
    changeDate(){
      if(this.selectedWallet.id)
        this.getTransactions(this.selectedWallet.id, this.month.year, this.month.month+1)
    },
    getTransactions(walletId, year, month){
      TransactionService.getTransactions(walletId, year, month).then(
        (response) => {
          this.transactions = response.data.body;
          console.log(this.transactions)
        }
      ).catch(() => {
        this.transactions = []
      })
    }
  },
  mounted() {
    WalletService.getWallets().then(
        (response) => {
          this.wallets = response.data.body;
        }
    ).catch(() => {
      this.wallets = []
    })
  },
  watch: {
    month(){
      this.changeDate()
    }
  }
};
</script>

<style scoped>
  .card{
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
</style>
