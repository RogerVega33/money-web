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
                <label>Buscar por:</label>
                <br>
                <input type="radio" id="month" value="month" v-model="dateRangePicked">
                <label for="month"> Mes</label>
                <br>
                <input type="radio" id="year" value="year" v-model="dateRangePicked">
                <label for="year"> Año</label>
                <br>
                <input type="radio" id="all" value="all" v-model="dateRangePicked">
                <label for="all"> Histórico</label>
              </div>
              <div v-if="dateRangePicked !== 'all'" class="mt-2">
                <Datepicker v-model="month" monthPicker autoApply v-if="dateRangePicked === 'month'"/>
                <Datepicker v-model="month.year" yearPicker autoApply v-if="dateRangePicked === 'year'"/>
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
                <div class="flex flex-row" v-if="selectedWallet && dateRangePicked === 'all'">
                  <div class="basis-1/2">
                    Monto inicial
                  </div>
                  <div class="basis-1/2 text-right">
                    {{selectedWallet.startingAmount || '0.0'}} $
                  </div>
                </div>
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
                    {{totalSavings}} $
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
          <div>
            <input type="text" v-model="transactionFilter"
                   class="w-full rounded text-gray-700 mr-3 py-1 px-2 leading-tight">
          </div>
          <div v-if="showTransactionsByCategory" class="flow-root">
            <ul role="list" class="divide-y divide-gray-200">
              <li class="py-3 sm:py-4" v-for="category in transactionsByCategory" :key="category.categoryName+category.total" @click="showDetail(category)">
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
                            <span class="font-bold">{{getTransactionDate(transaction.date)}}</span> | {{transaction.detail || 'Sin detalle'}}
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
import moment from 'moment'

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
    const transactionsTemp = ref([]);
    const selectedWallet = ref([]);
    const transactionsByCategory = ref([]);
    const showTransactionsByCategory = ref(true);
    const chartLabels = ref([]);
    const chartData = ref([]);
    const transactionFilter = ref("");
    const dateRangePicked = ref("month");
    return {
      month,
      wallets,
      transactions,
      transactionsTemp,
      transactionsByCategory,
      selectedWallet,
      showTransactionsByCategory,
      chartLabels,
      chartData,
      transactionFilter,
      dateRangePicked,
    }
  },
  computed: {
    currentUser(){
      return this.$store.state.auth.user;
    },
    totalSavings(){
      if(this.transactions.savings && this.selectedWallet.startingAmount){
        if(this.dateRangePicked === 'all')
          return (+this.transactions.savings + +this.selectedWallet.startingAmount).toFixed(2);
        return (+this.transactions.savings).toFixed(2);
      }
      return (0).toFixed(2);
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
      this.transactionFilter = "";
      let monthSelected = month;
      let yearSelected = year;
      if(this.dateRangePicked === 'year' || this.dateRangePicked === 'all') monthSelected = null;
      if(this.dateRangePicked === 'all') yearSelected = null;

      TransactionService.getTransactions(walletId, yearSelected, monthSelected).then(
        (response) => {
          this.transactions = response.data.body;
          this.transactionsTemp = [...response.data.body.transactions];
        }
      ).catch(() => {
        this.transactions = [];
        this.transactionsTemp = [];
      });
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
    },
    getTransactionDate(transactionDate){
      return moment(String(transactionDate)).format('MM/YY')
    },
    filterTransactions(){
      const val = this.transactionFilter.toLowerCase();
      this.transactions.transactions = this.transactionsTemp.filter(function (t) {
        let data1 = t.detail? t.detail.toLowerCase() : '';
        let data2 = t.categoryName? t.categoryName.toLowerCase() : '';
        return data1.indexOf(val) !== -1 || data2.indexOf(val) !== -1 || !val;
      });
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
    month: {
      handler() {
        this.changeDate();
      },
      deep: true
    },
    dateRangePicked(){
      this.changeDate()
    },
    transactions: {
      handler() {
        this.transactionsByCategory = this.groupBy('categoryName');
      },
      deep: true
    },
    transactionFilter(){
      this.filterTransactions();
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
