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
          <SearchSettings v-if="selectedWallet && !showForm" @change-search-settings="changeSearchSettings"/>
        </div>
      </div>

      <div class="lg:basis-1/3 p-1 lg:p-2">
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
                      @requestFullScreen="fullScreenChart('expenseChartContainer')"
                      title="Gastos"/>
          </div>
          <div ref="incomeChartContainer" id="incomeChartContainer">
            <BarChart v-if="selectedWallet && !showForm"
                      :labels="chartLabelsIncome"
                      :data="chartDataIncome"
                      :fullScreen="fullScreenIncome"
                      @requestFullScreen="fullScreenChart('incomeChartContainer')"
                      title="Ingresos"/>
          </div>
          <div ref="profitLossContainer" id="profitLossContainer">
            <LineChart v-if="selectedWallet && !showForm"
                       :labels="chartLabelsProfitLoss"
                       :datasets="chartDataProfitLoss"
                       :fullScreen="fullScreenProfitLoss"
                       @requestFullScreen="fullScreenChart('profitLossContainer')"
                       title="Histórico"/>
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
    const chartLabelsExpense = ref([]);
    const chartLabelsIncome = ref([]);
    const chartLabelsProfitLoss = ref([]);
    const chartDataExpense = ref([]);
    const chartDataIncome = ref([]);
    const chartDataProfitLoss = ref([]);
    const transactionFilter = ref("");
    const showFormNewWallet = ref(false);
    const showFormEditWallet = ref(false);
    const fullScreenIncome = ref(false);
    const fullScreenExpense = ref(false);
    const fullScreenProfitLoss = ref(false);
    const searchSettings = ref({
      dateSelected: {
        month: new Date().getMonth(),
        year: new Date().getFullYear()
      },
      dateRangePicked: "month",
      showTransactionsByCategory: true
    });
    return {
      wallets,
      transactions,
      transactionsTemp,
      transactionsByCategory,
      profitLoss,
      selectedWallet,
      chartLabelsExpense,
      chartLabelsIncome,
      chartLabelsProfitLoss,
      chartDataExpense,
      chartDataIncome,
      chartDataProfitLoss,
      transactionFilter,
      searchSettings,
      showFormNewWallet,
      showFormEditWallet,
      fullScreenIncome,
      fullScreenExpense,
      fullScreenProfitLoss,
    }
  },
  computed: {
    currentUser(){
      return this.$store.state.auth.user;
    },
    showForm(){
      return this.showFormNewWallet || this.showFormEditWallet;
    }
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
      this.getTransactions(this.selectedWallet.id, this.searchSettings.dateSelected.year, this.searchSettings.dateSelected.month+1);
      this.getProfitLoss(this.selectedWallet.id);
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
    }
  }
};
</script>

<style>
  .card{
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
</style>
