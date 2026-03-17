<template>
  <div class="transactions">
    <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4">
        <h5 v-if="selectedWallet.type !== 'crypto'" class="text-xl font-bold leading-none text-gray-900">Transacciones
          {{searchSettings.showTransactionsByCategory? 'x categoría' : ''}}</h5>
        <h5 v-else class="text-xl font-bold leading-none text-gray-900">Holdings</h5>
        <div>
          <fa :icon="showIconNewTransaction? 'plus':'xmark'"
              class="cursor-pointer"
              :class="showIconNewTransaction? 'text-green-600':'text-red-600'" @click="addTransaction"/>
        </div>
      </div>
      <div class="flow-root mb-5" v-if="!showIconNewTransaction">
        <hr class="mb-5">
        <h6 class="font-semibold">Nueva Transacción</h6>
        <div>
          <div class="mt-2">
            <label>Categoría: {{newTransaction.category}}</label>
            <br>
            <Multiselect v-model="newTransaction.categoryId"
                         valueProp="id"
                         :groups="true"
                         :searchable="true"
                         :options="categories"
                         group-options="categoryList"
                         group-label="category"
                         track-by="name"
                         label="name">
            </Multiselect>
          </div>
          <div class="mt-2">
            <label for="transactionDetail">Detalle:</label>
            <br>
            <input id="transactionDetail" type="text" v-model="newTransaction.detail"
                   class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   required>
          </div>
          <div class="mt-2">
            <label for="transactionAmount">Monto:</label>
            <br>
            <input id="transactionAmount" type="number" v-model="newTransaction.amount" placeholder="$ 0.00"
                   class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   required>
          </div>
          <div class="mt-2">
            <label>Fecha:</label>
            <br>
            <Datepicker v-model="newTransaction.date" autoApply :format="datepickerFormat"/>
          </div>
          <div class="mt-4">
            <p v-if="errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{errorMessage}}</p>
            <button type="button" @click="saveTransaction"
                    :disabled="!newTransaction.date || !newTransaction.amount || !newTransaction.categoryId"
                    class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-500 hover:bg-blue-600
                    disabled:opacity-75 disabled:hover:bg-blue-500">
              Guardar
            </button>
            <button type="button" @click="cancelNewTransaction"
                    class="mt-2 text-white font-bold py-2 px-4 rounded-lg w-full bg-gray-500 hover:bg-gray-600">
              Cancelar
            </button>
          </div>
        </div>
        <hr class="mt-5">
      </div>
      <div class="relative w-full">
        <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"
               xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"></path>
          </svg>
        </div>
        <input type="text" v-model="transactionFilter"
               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
      </div>
      <div v-if="searchSettings.showTransactionsByCategory && selectedWallet.type !== 'crypto'" class="flow-root">
        <ul role="list" class="divide-y divide-gray-200">
          <li class="py-3 sm:py-4" v-for="category in transactionsByCategory"
              :key="category.categoryName+category.total" @click="showDetail(category)">
            <div class="flex items-center space-x-4 text-gray-900 hover:text-blue-600 text-left w-full">
              <div class="flex-shrink-0">
                <fa icon="sack-dollar" class="text-green-700 h-8"/>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">
                  {{category.categoryName}}
                </p>
                <p class="text-sm truncate">
                  {{category.transactions.length}} transacciones
                </p>
              </div>
              <div class="inline-flex items-center text-base font-semibold"
                   :class="category.type === 'expense'?'text-red-500':'text-green-500'">
                {{category.type === 'expense'? '-' : '+'}}{{formatCurrency(category.total?.toFixed(2))}}
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
                      <p class="text-sm truncate" :title="transaction.detail || 'Sin detalle'">
                        <span class="font-bold">{{getTransactionDate(transaction.date)}}</span> | {{transaction.detail
                        || 'Sin detalle'}}
                      </p>
                    </div>
                    <div class="inline-flex items-center text-sm"
                         :class="transaction.type === 'expense'?'text-red-500':'text-green-500'">
                      {{transaction.type === 'expense'? '-' : '+'}}{{formatCurrency(transaction.amount?.toFixed(2))}}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="flow-root">
        <ul v-if="selectedWallet.type !== 'crypto'" role="list" class="divide-y divide-gray-200">
          <li class="py-3 sm:py-4" v-for="transaction in transactions.transactions" :key="transaction.id">
            <div
              class="flex items-center space-x-4 text-gray-900 hover:text-blue-600 cursor-pointer">
              <div class="flex-shrink-0">
                <fa icon="sack-dollar" class="text-green-700 h-8"/>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">
                  {{transaction.categoryName}}
                </p>
                <p class="text-sm truncate" :title="transaction.detail || 'Sin detalle'">
                  <span class="font-bold">{{getTransactionDate(transaction.date)}}</span>  | {{transaction.detail || 'Sin detalle'}}
                </p>
              </div>
              <div class="inline-flex items-center text-base font-semibold"
                   :class="transaction.type === 'expense'?'text-red-500':'text-green-500'">
                {{transaction.type === 'expense'? '-' : '+'}}{{formatCurrency(transaction.amount?.toFixed(2))}}
              </div>
            </div>
          </li>
        </ul>
        <ul v-else role="list" class="divide-y divide-gray-200">
          <li class="py-3 sm:py-4" v-for="transaction in transactions.transactions" :key="transaction.id">
            <div
                class="flex items-center space-x-4 text-gray-900 hover:text-blue-600 cursor-pointer">
              <div class="flex-shrink-0">
                <fa icon="coins"  class="text-yellow-500 h-8"/>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">
                  {{formatCryptoHoldings(transaction.amount)}} {{transaction.symbol}}
                </p>
                <p class="text-sm truncate" :title="'Última actualización: ' + formatDateTime(transaction.date)">
                  1 {{transaction.symbol}} = {{formatCurrency(transaction.price?.toFixed(2))}}
                </p>
              </div>
              <div class="inline-flex items-center text-base font-semibold text-green-500">
                {{formatCurrency(transaction.total?.toFixed(2))}}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import {ref} from 'vue';
import moment from 'moment'
import CategoryService from "../services/category.service";
import TransactionService from "../services/transaction.service";
import { formatCurrency, formatCryptoHoldings, formatDateTime } from '@/utils/formats';

export default {
    name: 'Transactions',
    props: {
        searchSettings: Object,
        transactionsByCategory: Array,
        transactions: Object,
        selectedWallet: Object,
    },
    setup() {
        const categories = ref([]);
        const transactionFilter = ref("");
        const showIconNewTransaction = ref(true);
        const newTransaction = ref({date: new Date()});
        const errorMessage = ref("");
        const options = ref(['Select option', 'a', 'b']);
        const value = ref("");
        const datepickerFormat = "dd/MM/yyyy";
        return {
            transactionFilter,
            showIconNewTransaction,
            newTransaction,
            categories,
            errorMessage,
            options,
            value,
            datepickerFormat,
        }
    },
    methods: {
        getTransactionDate(transactionDate) {
            return moment(String(transactionDate)).add({M:1}).format('MM/YY')
        },
        showDetail(category) {
            category.showDetail = !category.showDetail;
        },
        addTransaction() {
            this.resetNewTransaction();
            this.getCategories();
            this.showIconNewTransaction = !this.showIconNewTransaction;
        },
        saveTransaction() {
            this.errorMessage = '';
            TransactionService.saveTransaction(this.newTransaction).then(() => {
                this.resetNewTransaction();
                this.$emit('new-transaction');
            }).catch((error) => {
                this.errorMessage = (error.response &&
                    error.response.data &&
                    error.response.data.body?.message) ||
                    error.message ||
                    error.toString()
            })
        },
        resetNewTransaction() {
            this.errorMessage = '';
            this.newTransaction = {categoryId: null, date: new Date()};
        },
        cancelNewTransaction(){
            this.resetNewTransaction();
            this.showIconNewTransaction = true;
        },
        getCategories() {
            //if (this.categories.length === 0) {
                CategoryService.getCategories(this.selectedWallet.id).then((response) => {
                    const incomes = response.data.body.filter(c => c.type === 'income');
                    const expenses = response.data.body.filter(c => c.type === 'expense');
                    this.categories = [{category: 'Ingresos', categoryList: incomes}, {category: 'Gastos', categoryList: expenses}];
                }).catch((error) => {
                    console.log(error)
                })
            //}
        },
    },
    watch: {
        transactionFilter() {
            this.$emit('update-transaction-filter', this.transactionFilter);
        },
        searchSettings: {
            handler() {
                this.transactionFilter = "";
            },
            deep: true
        },
    },
    computed: {
      formatCurrency() {
          return formatCurrency;
      },
      formatCryptoHoldings() {
        return formatCryptoHoldings;
      },
      formatDateTime() {
        return formatDateTime;
      },
    },
}
</script>