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

      <div v-if="selectedWallet && selectedWallet.type !== 'crypto' && !showForm" class="lg:basis-1/3 p-1 lg:p-2">
        <div class="flex flex-col w-full">
          <Summary :selected-wallet="selectedWallet"
                   :transactions="transactions"
                   :show-starting-amount="searchSettings.dateRangePicked === 'all'"/>
          <div ref="incomeChartContainer" id="incomeChartContainer">
            <BarChart :labels="chartLabelsIncome"
                      :values="chartDataIncome"
                      :fullScreen="fullScreenIncome"
                      :hideMoney="hideMoney"
                      color="#1D9E75"
                      @requestFullScreen="fullScreenChart('incomeChartContainer')"
                      title="Ingresos"/>
          </div>
          <div ref="expenseChartContainer" id="expenseChartContainer">
            <BarChart :labels="chartLabelsExpense"
                      :values="chartDataExpense"
                      :fullScreen="fullScreenExpense"
                      :hideMoney="hideMoney"
                      color="#D85A30"
                      @requestFullScreen="fullScreenChart('expenseChartContainer')"
                      title="Gastos"/>
          </div>
          <div ref="profitLossContainer" id="profitLossContainer">
            <LineChart :labels="chartLabelsProfitLoss"
                       :datasets="chartDataProfitLoss"
                       :fullScreen="fullScreenProfitLoss"
                       :hideMoney="hideMoney"
                       @requestFullScreen="fullScreenChart('profitLossContainer')"
                       title="Histórico"/>
          </div>
        </div>
      </div>

      <div v-if="showForm" class="lg:basis-1/3 p-1 lg:p-2">
        <div class="flex flex-col w-full">
          <NewWallet v-if="showFormNewWallet" @success="walletSaved"/>
          <EditWallet v-if="selectedWallet && showFormEditWallet" :selected-wallet="selectedWallet"/>
        </div>
      </div>

      <div class="lg:basis-1/3 p-1 lg:p-2">
        <Transactions v-if="selectedWallet && !showForm"
                      :search-settings="searchSettings"
                      :transactions-by-category="transactionsByCategory"
                      :transactions="transactions"
                      :selected-wallet="selectedWallet"
                      @new-transaction="getAll"
                      @update-transaction="getAll"
                      @delete-transaction="getAll"
                      @new-crypto-transaction="getAllCrypto"
                      @update-crypto-transaction="getAllCrypto"
                      @delete-crypto-transaction="getAllCrypto"
                      @update-transaction-filter="updateTransactionFilter"/>
        <div ref="totalByCategoryContainer" id="totalByCategoryContainer" v-if="selectedWallet && selectedWallet.type !== 'crypto' && transactionFilter && chartLabelsTotalByCategory.length > 1">
          <LineChart :labels="chartLabelsTotalByCategory"
                     :datasets="chartDataTotalByCategory"
                     :fullScreen="fullScreenTotalByCategory"
                     :hideMoney="hideMoney"
                     :showAverage="true"
                     @requestFullScreen="fullScreenChart('totalByCategoryContainer')"
                     title="Total por categoría"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import WalletService from "../services/wallet.service";
import TransactionService from "../services/transaction.service";
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import BarChart from '../components/BarChart'
import LineChart from '../components/LineChart'
import Wallet from '../components/Wallet'
import SearchSettings from '../components/SearchSettings'
import Summary from '../components/Summary'
import Transactions from "../components/transactions/Transactions";
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

    const hideMoney = ref(store.state.app.hideMoney);

    const currentUser = computed(() => store.state.auth.user);

    const showForm = computed(() => {
      return showFormNewWallet.value || showFormEditWallet.value;
    });

    async function getWallets(){
      await WalletService.getWallets().then(
          (response) => {
            wallets.value = response.data.body;
          }
      ).catch(() => {
        wallets.value = []
      })
    }

    function selectWallet(wallet){
      selectedWallet.value = wallet;
      if(wallet.type === 'crypto'){
        getCryptoWalletTransactions(selectedWallet.value.id, searchSettings.value.dateSelected.year, searchSettings.value.dateSelected.month+1);
      } else {
        getTransactions(selectedWallet.value.id, searchSettings.value.dateSelected.year, searchSettings.value.dateSelected.month+1);
        getProfitLoss(selectedWallet.value.id);
      }
    }

    function changeSearchSettings(val){
      searchSettings.value = val;
    }

    function changeDate(){
      if(selectedWallet.value?.id)
        getTransactions(selectedWallet.value.id, searchSettings.value.dateSelected.year, searchSettings.value.dateSelected.month+1)
    }

    function updateTransactionFilter(val){
      transactionFilter.value = val;
    }

    function addWallet(){
      showFormNewWallet.value = true;
    }

    function hideForms(){
      showFormNewWallet.value = false;
      showFormEditWallet.value = false;
    }

    function editWallet(){
      showFormEditWallet.value = true;
    }

    function walletSaved(value){
      if(value) getWallets();
      showFormNewWallet.value = false;
    }

    function getAll(){
      getWallets();
      getTransactions(selectedWallet.value.id, searchSettings.value.dateSelected.year, searchSettings.value.dateSelected.month+1);
      getProfitLoss(selectedWallet.value.id);
    }

    function getAllCrypto(){
      getWallets();
      getCryptoWalletTransactions(selectedWallet.value.id);
    }

    function getTransactions(walletId, year, month){
      transactionFilter.value = "";
      let monthSelected = month;
      let yearSelected = year;

      if(searchSettings.value.dateRangePicked === 'year' || searchSettings.value.dateRangePicked === 'all') monthSelected = null;
      if(searchSettings.value.dateRangePicked === 'all') yearSelected = null;

      TransactionService.getTransactions(walletId, yearSelected, monthSelected).then(
          (response) => {
            transactions.value = response.data.body;
            transactionsTemp.value = [...response.data.body.transactions];
          }
      ).catch(() => {
        transactions.value = [];
        transactionsTemp.value = [];
      });
    }

    function getCryptoWalletTransactions(walletId){
      TransactionService.getCryptoWalletTransactions(walletId).then(
          (response) => {
            transactions.value = response.data.body;
            transactionsTemp.value = [...response.data.body.transactions];
          }
      ).catch(() => {
        transactions.value = [];
        transactionsTemp.value = [];
      });
    }

    function getProfitLoss(walletId){
      TransactionService.getProfitLoss(walletId).then((response) => {
        profitLoss.value = response.data.body.profitLoss;

        chartLabelsProfitLoss.value = [];
        chartDataProfitLoss.value = [];

        let income = { label: "Ingresos", data: [], fill: false, borderColor: '#109618' };
        let expense = { label: "Gastos", data: [], fill: false, borderColor: '#dc3912' };
        let savings = { label: "Ahorros", data: [], fill: false, borderColor: '#ff9900' };
        let total = { label: "Total", data: [], fill: false, borderColor: '#3366cc' };

        profitLoss.value.forEach(pl => {
          chartLabelsProfitLoss.value.push(pl.date.split("T")[0]);
          income.data.push(pl.income);
          expense.data.push(pl.expense);
          savings.data.push(pl.savings);
          total.data.push(pl.total);
        });

        chartDataProfitLoss.value.push(income, expense, savings, total);
      }).catch(() => {
        profitLoss.value = [];
      });
    }

    function groupBy(key){
      if(!transactions.value?.transactions) return [];

      let result = [];

      transactions.value.transactions.forEach(t => {
        let element = result.find(element => element[key] === t[key] && element.type === t.type);

        if(!element){
          result.push({
            [key]: t[key],
            type: t.type,
            total: t.amount,
            transactions: [t],
            showDetail: false
          });
        } else {
          element.total += t.amount;
          element.transactions.push(t);
        }
      });

      chartLabelsExpense.value = [];
      chartDataExpense.value = [];
      chartLabelsIncome.value = [];
      chartDataIncome.value = [];

      result.forEach(t => {
        if(t.type === 'expense'){
          chartLabelsExpense.value.push(t[key]);
          chartDataExpense.value.push(t.total);
        } else if(t.type === 'income') {
          chartLabelsIncome.value.push(t[key]);
          chartDataIncome.value.push(t.total);
        }
      });

      return result;
    }

    function filterTransactions(){
      const val = transactionFilter.value.toLowerCase();

      transactions.value.transactions = transactionsTemp.value.filter(function (t) {
        let data1 = t.detail? t.detail.toLowerCase() : '';
        let data2 = t.categoryName? t.categoryName.toLowerCase() : '';
        return data1.indexOf(val) !== -1 || data2.indexOf(val) !== -1 || !val;
      });

      getTotalCategories();
    }

    function getTotalCategories(){
      totalByCategory.value = [];
      chartLabelsTotalByCategory.value = [];
      chartDataTotalByCategory.value = [];

      // Agrupa las transacciones por fecha-categoria-tipo, saca su total y devuelve un array
      const groupedData = transactions.value.transactions.reduce((acc, transaction) => {
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
            transactions: [{
              date: transaction.date,
              totalAmount: transaction.totalAmount
            }]
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

      totalByCategory.value = Object.values(groupedData2);

      if(!totalByCategory.value || totalByCategory.value.length === 0) return;

      const biggerCategory = totalByCategory.value.reduce((maxObj, obj) => {
        return obj.transactions.length > maxObj.transactions.length ? obj : maxObj;
      }, totalByCategory.value[0]);

      let cat1 = {
        label: biggerCategory.detail,
        data: [],
        fill: false,
        borderColor: '#109618',
      };

      let labels = [];
      let total = [];

      biggerCategory.transactions.forEach(t => {
        labels.push(t.date.split("T")[0]);
        total.push(+t.totalAmount.toFixed(2));
      });

      chartLabelsTotalByCategory.value.push(...labels);
      cat1.data.push(...total);

      chartDataTotalByCategory.value.push(cat1);
    }

    function fullScreenChart(refs){
      const elem = document.getElementById(refs);
      if (elem.requestFullscreen && !document.webkitIsFullScreen) {
        elem.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }

    function handleFullScreen(event){
      const idContainer = event.target.id;

      fullScreenExpense.value = document.webkitIsFullScreen && idContainer === 'expenseChartContainer';
      fullScreenIncome.value = document.webkitIsFullScreen && idContainer === 'incomeChartContainer';
      fullScreenProfitLoss.value = document.webkitIsFullScreen && idContainer === 'profitLossContainer';
      fullScreenTotalByCategory.value = document.webkitIsFullScreen && idContainer === 'totalByCategoryContainer';
    }

    onMounted(() => {
      getWallets();
      document.addEventListener('fullscreenchange', handleFullScreen);
    });

    onUnmounted(() => {
      document.removeEventListener('fullscreenchange', handleFullScreen);
    });

    watch(searchSettings, () => {
      changeDate();
    }, { deep: true });

    watch(transactions, () => {
      transactionsByCategory.value = groupBy('categoryName');
    }, { deep: true });

    watch(transactionFilter, () => {
      filterTransactions();
    });

    watch(() => store.state.app.hideMoney, (newValue) => {
      hideMoney.value = newValue;
    });

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
      currentUser,
      showForm,
      selectWallet,
      addWallet,
      hideForms,
      editWallet,
      walletSaved,
      changeSearchSettings,
      updateTransactionFilter,
      getAll,
      getAllCrypto,
      fullScreenChart
    };
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
