<template>
  <div class="transactions">
    <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">Transacciones {{searchSettings.showTransactionsByCategory? 'x categoría' : ''}}</h5>
      </div>
      <div class="relative w-full">
        <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
        </div>
        <input type="text" v-model="transactionFilter"
               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
      </div>
      <div v-if="searchSettings.showTransactionsByCategory" class="flow-root">
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
</template>

<script>
import { ref } from 'vue';
import moment from 'moment'

export default {
  name: 'Transactions',
  props: {
    searchSettings: Object,
    transactionsByCategory: Array,
    transactions: Object
  },
  setup() {
    const transactionFilter = ref("");
    return {
      transactionFilter,
    }
  },
  methods: {
    getTransactionDate(transactionDate){
        return moment(String(transactionDate)).format('MM/YY')
    },
    showDetail(category){
        category.showDetail = !category.showDetail;
    },
  },
  watch: {
    transactionFilter(){
      this.$emit('update-transaction-filter', this.transactionFilter);
    },
    searchSettings: {
      handler() {
        this.transactionFilter = "";
      },
      deep: true
    },
  }
}
</script>