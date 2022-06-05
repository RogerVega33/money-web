<template>
  <div class="container mx-auto flex flex-col lg:flex-row">
    <div class="lg:basis-1/3">
      <div class="flex flex-col w-full">
        <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
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
        <div class="w-full mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
            <div class="flex justify-between items-center mb-4">
              <h5 class="text-xl font-bold leading-none text-gray-900">Configuración</h5>
            </div>
            <div class="flow-root">
              <div>
                <label>Fecha</label>
                <Datepicker v-model="month" monthPicker autoApply />
              </div>
              <div class="mt-4">
                <label for="checked-toggle" class="relative inline-flex items-center mb-4 cursor-pointer">
                  <input type="checkbox" value="" id="checked-toggle" class="sr-only peer" v-model="showTransactionsByCategory">
                  <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Mostrar transacciones por categoría</span>
                </label>
              </div>
            </div>
          </div>
      </div>
    </div>

    <div class="lg:basis-1/3">
      <div class="flex flex-col w-full">
        <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
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
        <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
          <div class="flex justify-between items-center mb-4">
            <h5 class="text-xl font-bold leading-none text-gray-900">Transacciones {{showTransactionsByCategory? 'x categoría' : ''}}</h5>
          </div>
          <div v-if="showTransactionsByCategory" class="flow-root">
            <ul role="list" class="divide-y divide-gray-200">
              <li class="py-3 sm:py-4" v-for="category in transactionsByCategory" :key="category.categoryName" @click="showDetail(category)">
                <div class="flex items-center space-x-4 text-gray-900 hover:text-blue-600 text-left w-full">
                  <div class="flex-shrink-0">
                    <fa icon="sack-dollar" class="text-green-700 h-8" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">
                      {{category.categoryName}}
                    </p>
                    <p class="text-sm truncate">
                      {{category.transactions.length}} transacciones
                    </p>
                  </div>
                  <div class="inline-flex items-center text-base font-semibold" :class="category.type === 'expense'?'text-red-500':'text-green-500'">
                    {{category.type === 'expense'? '-' : '+'}}{{category.total.toFixed(2)}} $
                  </div>
                </div>
                <div v-show="category.showDetail">
                  <div class="flex justify-between items-center mt-5">
                    <span class="font-medium text-gray-900">Detalle</span>
                  </div>
                  <ul role="list" class="divide-y divide-gray-200">
                    <li class="py-3 sm:py-4" v-for="transaction in category.transactions" :key="transaction.id">
                      <div class="flex items-center space-x-4 text-gray-900 hover:text-blue-600 cursor-pointer">
                        <div class="flex-1 min-w-0">
                          <p class="text-sm truncate">
                            {{transaction.detail || 'Sin detalle'}}
                          </p>
                        </div>
                        <div class="inline-flex items-center text-sm" :class="transaction.type === 'expense'?'text-red-500':'text-green-500'">
                          {{transaction.type === 'expense'? '-' : '+'}}{{transaction.amount.toFixed(2)}} $
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
          <div v-else class="flow-root">
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
                    {{transaction.type === 'expense'? '-' : '+'}}{{transaction.amount.toFixed(2)}} $
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:basis-1/3" v-if="chartLabels.length && chartData.length">
      <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
        <div class="flex justify-between items-center mb-4">
          <h5 class="text-xl font-bold leading-none text-gray-900">Gastos</h5>
        </div>
        <BarChart :labels="chartLabels" :data="chartData" title="Gastos"/>
      </div>
    </div>
  </div>

</template>
<script>
import WalletService from "../services/wallet.service";
import TransactionService from "../services/transaction.service";
import { ref } from 'vue';
import BarChart from '../components/BarChart'

export default {
  name: 'Dashboard',
  components: { BarChart },
  setup() {
    const month = ref({
      month: new Date().getMonth(),
      year: new Date().getFullYear()
    });
    const wallets = ref([]);
    const transactions = ref([]);
    const selectedWallet = ref([]);
    const transactionsByCategory = ref([]);
    const showTransactionsByCategory = ref(true);
    const chartLabels = ref([]);
    const chartData = ref([]);
    return {
      month,
      wallets,
      transactions,
      transactionsByCategory,
      selectedWallet,
      showTransactionsByCategory,
      chartLabels,
      chartData
    }
  },
  computed: {
    currentUser(){
      return this.$store.state.auth.user;
    },
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
        }
      ).catch(() => {
        this.transactions = []
      })
    },
    groupBy(key){
      let result = [];
      this.transactions.transactions.forEach(t => {
        let element = result.find(element => element[key] === t[key] && element.type === t.type);
        if(!element)
          result.push({
            [key]: t[key],
            type: t.type,
            total: t.amount,
            transactions: [t],
            showDetail: false
          });
        else{
          element.total += t.amount;
          element.transactions.push(t);
        }
      });
      this.chartLabels = [];
      this.chartData = [];
      result.forEach(t => {
        if(t.type === 'expense'){
          this.chartLabels.push(t[key]);
          this.chartData.push(t.total);
        }
      });

      return result
    },
    showDetail(category){
      category.showDetail = !category.showDetail;
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
    },
    transactions(){
      this.transactionsByCategory = this.groupBy('categoryName')
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
