<template>
  <div class="dashboard">
    <div class="container mx-auto flex flex-col lg:flex-row">

      <div class="lg:basis-1/3">
        <div class="flex flex-col w-full">
          <Wallet :wallets="wallets" :show-form-new-wallet="showFormNewWallet" @select-wallet="selectWallet" @add-wallet="addWallet"/>
          <SearchSettings v-if="selectedWallet && !showFormNewWallet" @change-search-settings="changeSearchSettings"/>
        </div>
      </div>

      <div class="lg:basis-1/3">
        <div class="flex flex-col w-full">
          <Summary v-if="selectedWallet && !showFormNewWallet"
                   :selected-wallet="selectedWallet"
                   :transactions="transactions"
                   :show-starting-amount="searchSettings.dateRangePicked === 'all'"/>
          <BarChart v-if="selectedWallet && !showFormNewWallet"
                    :labels="chartLabels"
                    :selected-wallet="selectedWallet"
                    :data="chartData"
                    title="Gastos"/>
          <NewWallet v-if="showFormNewWallet" @success="walletSaved"/>
        </div>
      </div>

      <div class="lg:basis-1/3">
        <Transactions v-if="selectedWallet && !showFormNewWallet"
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
import Wallet from '../components/Wallet'
import SearchSettings from '../components/SearchSettings'
import Summary from '../components/Summary'
import Transactions from "../components/Transactions";
import NewWallet from "../components/NewWallet";

export default {
  name: 'Dashboard',
  components: {Transactions, BarChart, Wallet, SearchSettings, Summary, NewWallet },
  setup() {
    const wallets = ref([]);
    const transactions = ref([]);
    const transactionsTemp = ref([]);
    const selectedWallet = ref();
    const transactionsByCategory = ref([]);
    const chartLabels = ref([]);
    const chartData = ref([]);
    const transactionFilter = ref("");
    const showFormNewWallet = ref(false);
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
      selectedWallet,
      chartLabels,
      chartData,
      transactionFilter,
      searchSettings,
      showFormNewWallet,
    }
  },
  computed: {
    currentUser(){
      return this.$store.state.auth.user;
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
      this.getTransactions(this.selectedWallet.id, this.searchSettings.dateSelected.year, this.searchSettings.dateSelected.month+1)
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
    addWallet(value){
      this.showFormNewWallet = value;
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
    this.getWallets();
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
