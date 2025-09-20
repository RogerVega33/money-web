<template>
  <div class="dashboard">
    <div class="container mx-auto flex flex-col lg:flex-row">

      <div class="lg:basis-1/3 p-1 lg:p-2">
        <div class="flex flex-col w-full">
          <Wallet :wallets="wallets"
                  :show-form-new-wallet="showFormNewWallet"
                  :show-form-edit-wallet="showFormEditWallet"
                  @select-wallet="selectWallet"
                  @add-wallet="addWallet"
                  @hide-forms="hideForms"
                  @edit-wallet="editWallet"/>
          <SearchSettings v-if="selectedWallet && !showForm" :selected-wallet="selectedWallet" @change-search-settings="changeSearchSettings"/>
        </div>
      </div>

      <div v-if="selectedWallet && selectedWallet.type !=='crypto'" class="lg:basis-1/3 p-1 lg:p-2">
        <div class="flex flex-col w-full">
          <Summary v-if="selectedWallet && !showForm"
                   :selected-wallet="selectedWallet"
                   :transactions="transactions"
                   :show-starting-amount="searchSettings.dateRangePicked === 'all'"/>
          <div ref="expenseChartContainer" id="expenseChartContainer">
            <BarChart v-if="selectedWallet && !showForm"
                      :labels="chartLabelsExpense"
                      :data="chartDataExpense"
                      :fullScreen="fullScreenExpense"
                      :hideMoney="hideMoney"
                      @requestFullScreen="fullScreenChart('expenseChartContainer')"
                      title="Gastos"/>
          </div>
          <div ref="incomeChartContainer" id="incomeChartContainer">
            <BarChart v-if="selectedWallet && !showForm"
                      :labels="chartLabelsIncome"
                      :data="chartDataIncome"
                      :fullScreen="fullScreenIncome"
                      :hideMoney="hideMoney"
                      @requestFullScreen="fullScreenChart('incomeChartContainer')"
                      title="Ingresos"/>
          </div>
          <div ref="profitLossContainer" id="profitLossContainer">
            <LineChart v-if="selectedWallet && !showForm"
                       :labels="chartLabelsProfitLoss"
                       :datasets="chartDataProfitLoss"
                       :fullScreen="fullScreenProfitLoss"
                       :hideMoney="hideMoney"
                       @requestFullScreen="fullScreenChart('profitLossContainer')"
                       title="Histórico"/>
          </div>
          <div ref="totalByCategoryContainer" id="totalByCategoryContainer" v-if="chartLabelsTotalByCategory.length > 1">
            <LineChart v-if="selectedWallet && !showForm"
                       :labels="chartLabelsTotalByCategory"
                       :datasets="chartDataTotalByCategory"
                       :fullScreen="fullScreenTotalByCategory"
                       :hideMoney="hideMoney"
                       @requestFullScreen="fullScreenChart('totalByCategoryContainer')"
                       title="Total por categoría"/>
          </div>
          <NewWallet v-if="showFormNewWallet" @success="walletSaved"/>
          <EditWallet v-if="showFormEditWallet" :selected-wallet="selectedWallet"/>
        </div>
      </div>

      <div class="lg:basis-1/3 p-1 lg:p-2">
        <Transactions v-if="selectedWallet && !showForm"
                      :search-settings="searchSettings"
                      :transactions-by-category="transactionsByCategory"
                      :transactions="transactions"
                      :selected-wallet="selectedWallet"
                      @new-transaction="getAll"
                      @update-transaction-filter="updateTransactionFilter"/>
      </div>
    </div>
  </div>
</template>
<script>
import WalletService from "../services/wallet.service";
import TransactionService from "../services/transaction.service";
import { ref } from 'vue';
import BarChart from '../components/BarChart'
import LineChart from '../components/LineChart'
import Wallet from '../components/Wallet'
import SearchSettings from '../components/SearchSettings'
import Summary from '../components/Summary'
import Transactions from "../components/Transactions";
import NewWallet from "../components/NewWallet";
import EditWallet from "../components/EditWallet";
import store from '../store'

export default {
  name: 'Dashboard',
  components: {Transactions, BarChart, LineChart, Wallet, SearchSettings, Summary, NewWallet, EditWallet },
  setup() {
    const wallets = ref([]);
    const transactions = ref([]);
    const transactionsTemp = ref([]);
    const selectedWallet = ref();
    const transactionsByCategory = ref([]);
    const profitLoss = ref([]);
    const totalByCategory = ref([]);
    const chartLabelsExpense = ref([]);
    const chartLabelsIncome = ref([]);
    const chartLabelsProfitLoss = ref([]);
    const chartLabelsTotalByCategory = ref([]);
    const chartDataExpense = ref([]);
    const chartDataIncome = ref([]);
    const chartDataProfitLoss = ref([]);
    const chartDataTotalByCategory = ref([]);
    const transactionFilter = ref("");
    const showFormNewWallet = ref(false);
    const showFormEditWallet = ref(false);
    const fullScreenIncome = ref(false);
    const fullScreenExpense = ref(false);
    const fullScreenProfitLoss = ref(false);
    const fullScreenTotalByCategory = ref(false);
    const searchSettings = ref({
      dateSelected: {
        month: new Date().getMonth(),
        year: new Date().getFullYear()
      },
      dateRangePicked: "month",
      showTransactionsByCategory: true
    });
    const hideMoney = ref(store.state.app.hideMoney)
    return {
      wallets,
      transactions,
      transactionsTemp,
      transactionsByCategory,
      profitLoss,
      totalByCategory,
      selectedWallet,
      chartLabelsExpense,
      chartLabelsIncome,
      chartLabelsProfitLoss,
      chartLabelsTotalByCategory,
      chartDataExpense,
      chartDataIncome,
      chartDataProfitLoss,
      chartDataTotalByCategory,
      transactionFilter,
      searchSettings,
      showFormNewWallet,
      showFormEditWallet,
      fullScreenIncome,
      fullScreenExpense,
      fullScreenProfitLoss,
      fullScreenTotalByCategory,
      hideMoney,
    }
  },
  computed: {
    currentUser(){
      return this.$store.state.auth.user;
    },
    showForm(){
      return this.showFormNewWallet || this.showFormEditWallet;
    },
  },
  methods: {
    async getWallets(){
      await WalletService.getWallets().then(
          (response) => {
              this.wallets = response.data.body;
          }
      ).catch(() => {
          this.wallets = []
      })
    },
    selectWallet(wallet){
      this.selectedWallet = wallet;
      if(wallet.type === 'crypto'){
        this.getCryptoWalletTransactions(this.selectedWallet.id, this.searchSettings.dateSelected.year, this.searchSettings.dateSelected.month+1);
      } else {
        this.getTransactions(this.selectedWallet.id, this.searchSettings.dateSelected.year, this.searchSettings.dateSelected.month+1);
        this.getProfitLoss(this.selectedWallet.id);
      }
    },
    changeSearchSettings(searchSettings){
      this.searchSettings = searchSettings;
    },
    changeDate(){
      if(this.selectedWallet.id)
        this.getTransactions(this.selectedWallet.id, this.searchSettings.dateSelected.year, this.searchSettings.dateSelected.month+1)
    },
    updateTransactionFilter(transactionFilter){
      this.transactionFilter = transactionFilter;
    },
    addWallet(){
      this.showFormNewWallet = true;
    },
    hideForms(){
      this.showFormNewWallet = false;
      this.showFormEditWallet = false;
    },
    editWallet(){
      this.showFormEditWallet = true;
    },
    walletSaved(value){
      if(value) this.getWallets();
      this.showFormNewWallet = false;
    },
    getAll(){
        this.getWallets();
        this.getTransactions(this.selectedWallet.id, this.searchSettings.dateSelected.year, this.searchSettings.dateSelected.month+1);
        this.getProfitLoss(this.selectedWallet.id);
    },
    getTransactions(walletId, year, month){
      this.transactionFilter = "";
      let monthSelected = month;
      let yearSelected = year;
      if(this.searchSettings.dateRangePicked === 'year' || this.searchSettings.dateRangePicked === 'all') monthSelected = null;
      if(this.searchSettings.dateRangePicked === 'all') yearSelected = null;

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
    getCryptoWalletTransactions(walletId){
      TransactionService.getCryptoWalletTransactions(walletId).then(
          (response) => {
            this.transactions = response.data.body;
            this.transactionsTemp = [...response.data.body.transactions];
          }
      ).catch(() => {
        this.transactions = [];
        this.transactionsTemp = [];
      });
    },
    getProfitLoss(walletId){
      TransactionService.getProfitLoss(walletId).then((response) => {
        this.profitLoss = response.data.body.profitLoss;
        this.chartLabelsProfitLoss = [];
        this.chartDataProfitLoss = [];
        let income = {
          label: "Ingresos",
          data: [],
          fill: false,
          borderColor: '#109618',
        };
        let expense = {
          label: "Gastos",
          data: [],
          fill: false,
          borderColor: '#dc3912',
        };
        let savings = {
          label: "Ahorros",
          data: [],
          fill: false,
          borderColor: '#ff9900',
        };
        let total = {
          label: "Total",
          data: [],
          fill: false,
          borderColor: '#3366cc',
        };
        this.profitLoss.forEach(pl => {
          this.chartLabelsProfitLoss.push(pl.date.split("T")[0]);
          income.data.push(pl.income);
          expense.data.push(pl.expense);
          savings.data.push(pl.savings);
          total.data.push(pl.total);
        });
        this.chartDataProfitLoss.push(income, expense, savings, total);
      }).catch(() => {
        this.profitLoss = [];
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
      this.chartLabelsExpense = [];
      this.chartDataExpense = [];
      this.chartLabelsIncome = [];
      this.chartDataIncome = [];
      result.forEach(t => {
        if(t.type === 'expense'){
          this.chartLabelsExpense.push(t[key]);
          this.chartDataExpense.push(t.total);
        } else if(t.type === 'income') {
            this.chartLabelsIncome.push(t[key]);
            this.chartDataIncome.push(t.total);
        }
      });

      return result
    },
    filterTransactions(){
      const val = this.transactionFilter.toLowerCase();
      this.transactions.transactions = this.transactionsTemp.filter(function (t) {
        let data1 = t.detail? t.detail.toLowerCase() : '';
        let data2 = t.categoryName? t.categoryName.toLowerCase() : '';
        return data1.indexOf(val) !== -1 || data2.indexOf(val) !== -1 || !val;
      });
      this.getTotalCategories();
    },
    getTotalCategories(){
      this.totalByCategory = [];
      this.chartLabelsTotalByCategory = [];
      this.chartDataTotalByCategory = [];

      // Agrupa las transacciones por fecha-categoria-tipo, saca su total y devuelve un array
      const groupedData = this.transactions.transactions.reduce((acc, transaction) => {
        const key = `${transaction.date}-${transaction.categoryName}-${transaction.type}`;

        if (!acc[key]) {
          acc[key] = {
            date: transaction.date,
            detail: transaction.categoryName,
            type: transaction.type,
            totalAmount: transaction.amount
          };
        } else {
          acc[key].totalAmount += transaction.amount;
        }

        return acc;
      }, {});
      const resultArray = Object.values(groupedData);

      // Transforma el array en otro array donde su clave es la categoria calculada anteriormente
      const groupedData2 = resultArray.reduce((acc, transaction) => {
        const key = `${transaction.detail}-${transaction.type}`;
        const type = transaction.type === 'income' ? '(+)' : '(-)'
        if (!acc[key]) {
          acc[key] = {
            detail: `${transaction.detail} ${type}`,
            transactions: [
              {
                date: transaction.date,
                totalAmount: transaction.totalAmount
              }
            ]
          };
        } else {
          const existingTransaction = acc[key].transactions.find(t => t.date === transaction.date);

          if (existingTransaction) {
            existingTransaction.totalAmount += transaction.totalAmount;
          } else {
            acc[key].transactions.push({
              date: transaction.date,
              totalAmount: transaction.totalAmount
            });
          }
        }

        return acc;
      }, {});
      this.totalByCategory = Object.values(groupedData2);

      if(!this.totalByCategory || this.totalByCategory.length === 0) return;

      const biggerCategory = this.totalByCategory.reduce((maxObj, obj) => {
        return obj.transactions.length > maxObj.transactions.length ? obj : maxObj;
      }, this.totalByCategory[0]);

      let cat1 = {
        label: biggerCategory.detail,
        data: [],
        fill: false,
        borderColor: '#109618',
      };

      let avg = {
        label: 'Promedio',
        data: [],
        fill: false,
        borderColor: '#3366cc',
      };

      let labels = [];
      let total = [];

      biggerCategory.transactions.forEach(t => {
        labels.push(t.date.split("T")[0]);
        total.push(+t.totalAmount.toFixed(2));
      });
      this.chartLabelsTotalByCategory.push(...labels);
      cat1.data.push(...total);

      const totalAmount = cat1.data.reduce((total, amount) => total + amount, 0);
      const average = totalAmount / cat1.data.length;
      const averageArray = new Array(cat1.data.length);
      averageArray.fill(+average.toFixed(2));
      avg.data = averageArray;

      this.chartDataTotalByCategory.push(cat1, avg);
    },
    fullScreenChart(refs){
        const elem = this.$refs[refs];
        if (elem.requestFullscreen && !document.webkitIsFullScreen) {
          elem.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    },
    handleFullScreen(event){
      const idContainer = event.target.id;
      this.fullScreenExpense = document.webkitIsFullScreen && idContainer === 'expenseChartContainer';
      this.fullScreenIncome = document.webkitIsFullScreen && idContainer === 'incomeChartContainer';
      this.fullScreenProfitLoss = document.webkitIsFullScreen && idContainer === 'profitLossContainer';
      this.fullScreenTotalByCategory = document.webkitIsFullScreen && idContainer === 'totalByCategoryContainer';
    }
  },
  mounted() {
    this.getWallets();
    this.$el.addEventListener('fullscreenchange', this.handleFullScreen);
  },
  unmonunted() {
    this.$el.removeEventListener('fullscreenchange');
  },
  watch: {
    searchSettings: {
      handler() {
        this.changeDate();
      },
      deep: true
    },
    transactions: {
      handler() {
        this.transactionsByCategory = this.groupBy('categoryName');
      },
      deep: true
    },
    transactionFilter(){
      this.filterTransactions();
    },
    '$store.state.app.hideMoney': function(newValue) {
        this.hideMoney = newValue
    }
  }
};
</script>

<style src="@vueform/multiselect/themes/default.css"></style>

<style>
  .card{
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
</style>
