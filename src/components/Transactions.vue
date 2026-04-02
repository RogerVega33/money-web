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
      <!-- Nueva transacción -->
      <div class="flow-root mb-5" v-if="!showIconNewTransaction">
        <hr class="mb-5">
        <h6 class="font-semibold">Nueva Transacción</h6>
        <div v-if="selectedWallet.type !== 'crypto'">
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
        <div v-else>
          <div class="mt-2">
            <label for="transactionDetail">Símbolo:</label>
            <br>
            <input id="transactionDetail" type="text" v-model="newCryptoTransaction.symbol"
                   class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   required>
          </div>
          <div class="mt-2">
            <label for="transactionAmount">Monto:</label>
            <br>
            <input id="transactionAmount" type="number" v-model="newCryptoTransaction.amount" placeholder="0"
                   @keydown="blockInvalidChars"
                   class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   required>
          </div>
          <div class="mt-4">
            <p v-if="errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{errorMessage}}</p>
            <button type="button" @click="saveTransaction"
                    :disabled="!newCryptoTransaction.symbol || !newCryptoTransaction.amount"
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
      <!-- Barra de búsqueda -->
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
      <!-- Lista de transacciones por categoría -->
      <div v-if="searchSettings.showTransactionsByCategory && selectedWallet.type !== 'crypto'" class="flow-root">
        <ul role="list" class="divide-y divide-gray-200">
          <li class="py-3 sm:py-4" v-for="category in transactionsByCategory"
              :key="category.categoryName+category.total">
            <!-- Resumen de la categoría -->
            <div @click="showDetail(category)" class="flex items-center space-x-4 text-gray-900 hover:text-blue-600 text-left w-full">
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
            <!-- Lista de transacciones -->
            <div v-show="category.showDetail">
              <div class="flex justify-between items-center mt-5">
                <span class="font-medium text-gray-900">Detalle</span>
              </div>
              <ul role="list" class="divide-y divide-gray-200">
                <li class="py-3 sm:py-4" v-for="transaction in category.transactions" :key="transaction.id">
                  <!-- Edición de transacciones -->
                  <div v-if="transactionSelected && transaction.id === transactionSelected.id && showEditTransactionSection" class="relative w-full" >
                    <h6 class="font-semibold">Editar transacción</h6>
                    <div class="mt-2">
                      <label>Categoría: {{transactionSelected.category}}</label>
                      <br>
                      <Multiselect v-model="transactionSelected.categoryId"
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
                      <input id="transactionDetail" type="text" v-model="transactionSelected.detail"
                             placeholder="Detalle"
                             class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                             required>
                    </div>
                    <div class="mt-2">
                      <label for="transactionAmount">Monto:</label>
                      <br>
                      <input id="transactionAmount" type="number" v-model="transactionSelected.amount" placeholder="$ 0.00"
                             @keydown="blockInvalidChars"
                             class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                             required>
                    </div>
                    <div class="mt-2">
                      <label>Fecha:</label>
                      <br>
                      <Datepicker v-model="transactionSelected.date" autoApply :format="datepickerFormat"/>
                    </div>
                    <div class="mt-4">
                      <p v-if="errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{errorMessage}}</p>
                      <button type="button" @click="updateTransaction(transactionSelected)"
                              :disabled="!transactionSelected.date || !transactionSelected.amount || !transactionSelected.categoryId"
                              class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-75 disabled:hover:bg-blue-500">
                        Guardar
                      </button>
                      <button type="button" @click="cancel" class="mt-2 text-white font-bold py-2 px-4 rounded-lg w-full bg-gray-500 hover:bg-gray-600">
                        Cancelar
                      </button>
                    </div>
                  </div>
                  <div v-else class="flex items-center space-x-4 text-gray-900 hover:text-blue-600">
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
                    <!-- Menú 3 puntos -->
                    <div class="relative" @click.stop>
                      <button @click="toggleMenu(transaction.id)"
                              class="flex items-center text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8a2 2 0 100-4 2 2 0 000 4zm0 2a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4z"/>
                        </svg>
                      </button>
                      <div v-if="openMenuId === transaction.id"
                           class="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div @click="addTransaction(transaction)"
                             class="px-4 py-2 text-sm text-blue-500 hover:bg-gray-100 cursor-pointer rounded-t-lg">
                          <fa icon="plus"/> Nueva
                        </div>
                        <div @click="showEditTransaction(transaction)"
                             class="px-4 py-2 text-sm text-sky-500 hover:bg-gray-100 cursor-pointer rounded-t-lg">
                          <fa icon="pencil"/> Editar
                        </div>
                        <div @click="deleteTransaction(transaction)"
                             class="px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer rounded-b-lg">
                          <fa icon="trash-can"/> Eliminar
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
      <!-- Lista de transacciones sin agrupar -->
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
            <!-- Edición de transacciones -->
            <div v-if="transactionSelected && transaction.id === transactionSelected.id && showEditTransactionSection" class="relative w-full" >
              <input type="number" v-model="transactionSelected.amount"
                     v-on:keyup.enter="updateTransaction(transactionSelected)" v-on:keyup.esc="cancel"
                     @keydown="blockInvalidChars"
                     class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
              <button type="button" class="flex absolute inset-y-0 right-6 items-center pr-3">
                <fa icon="check" class="text-green-500 cursor-pointer" @click="updateTransaction(transactionSelected)"/>
              </button>
              <button type="button" class="flex absolute inset-y-0 right-0 items-center pr-3">
                <fa icon="times" class="text-red-500 cursor-pointer" @click="cancel"/>
              </button>
            </div>
            <div v-else
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
              <!-- Menú 3 puntos -->
              <div class="relative" @click.stop>
                <button @click="toggleMenu(transaction.id)"
                        class="flex items-center text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8a2 2 0 100-4 2 2 0 000 4zm0 2a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4z"/>
                  </svg>
                </button>
                <div v-if="openMenuId === transaction.id"
                     class="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div @click="showEditTransaction(transaction)"
                       class="px-4 py-2 text-sm text-sky-500 hover:bg-gray-100 cursor-pointer rounded-t-lg">
                    <fa icon="pencil"/> Editar
                  </div>
                  <div @click="deleteTransaction(transaction)"
                       class="px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer rounded-b-lg">
                    <fa icon="trash-can"/> Eliminar
                  </div>
                </div>
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
import Swal from 'sweetalert2'

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
        const newCryptoTransaction = ref({});
        const errorMessage = ref("");
        const options = ref(['Select option', 'a', 'b']);
        const value = ref("");
        const datepickerFormat = "dd/MM/yyyy";
        const openMenuId = ref(null);
        const showEditTransactionSection = ref(false);
        const transactionSelected = ref();
      return {
            transactionFilter,
            showIconNewTransaction,
            newTransaction,
            newCryptoTransaction,
            categories,
            errorMessage,
            options,
            value,
            datepickerFormat,
            openMenuId,
            showEditTransactionSection,
            transactionSelected,
        }
    },
    methods: {
        getTransactionDate(transactionDate) {
          return moment.utc(String(transactionDate)).format('MM/yy')
        },
        showDetail(category) {
            category.showDetail = !category.showDetail;
        },
        addTransaction(transaction) {
          this.resetNewTransaction();
          if(transaction && transaction.id) {
            this.hideEditTransactionMenu();
            this.newTransaction.categoryId = transaction.categoryId;
            this.newTransaction.amount = transaction.amount;
            this.newTransaction.detail = transaction.detail;
            this.newTransaction.date = null;
            this.showIconNewTransaction = false;
            return;
          }
          this.showIconNewTransaction = !this.showIconNewTransaction;
        },
        saveTransaction() {
            this.errorMessage = '';
            if(this.selectedWallet.type !== 'crypto') {
              this.newTransaction.date = moment(this.newTransaction.date).format('YYYY-MM-DD');
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
            } else {
              this.newCryptoTransaction.walletId = this.selectedWallet.id;
              TransactionService.saveCryptoTransaction(this.newCryptoTransaction).then(() => {
                this.resetNewTransaction();
                this.$emit('new-crypto-transaction');
              }).catch((error) => {
                this.errorMessage = (error.response &&
                        error.response.data &&
                        error.response.data.body?.message) ||
                    error.message ||
                    error.toString()
              })
            }
        },
        resetNewTransaction() {
            this.errorMessage = '';
            this.newTransaction = {categoryId: null, date: new Date(), detail: null, amount: null};
            this.newCryptoTransaction = {};
        },
        cancelNewTransaction(){
            this.resetNewTransaction();
            this.showIconNewTransaction = true;
        },
        getCategories() {
          CategoryService.getCategories(this.selectedWallet.id).then((response) => {
              const incomes = response.data.body.filter(c => c.type === 'income');
              const expenses = response.data.body.filter(c => c.type === 'expense');
              this.categories = [{category: 'Ingresos', categoryList: incomes}, {category: 'Gastos', categoryList: expenses}];
          }).catch((error) => {
              console.log(error)
          })
        },
        toggleMenu(id) {
          this.openMenuId = this.openMenuId === id ? null : id;
        },
        hideEditTransactionMenu(){
          this.openMenuId = null;
        },
        showEditTransaction(transaction) {
          this.hideEditTransactionMenu();
          this.transactionSelected = Object.assign({}, transaction);
          this.showEditTransactionSection = true;
        },
        updateTransaction(transaction) {
          if(this.selectedWallet.type !== 'crypto') {
            transaction.date = moment(transaction.date).format('YYYY-MM-DD');
            TransactionService.updateTransaction(transaction).then(() => {
              this.cancel();
              this.resetNewTransaction();
              this.$emit('update-transaction');
            }).catch((error) => {
              console.error(error)
              Swal.fire("No se pudo eliminar la transacción", "", "error");
            })
          } else {
            TransactionService.updateCryptoTransaction(transaction).then(() => {
              this.cancel();
              this.resetNewTransaction();
              this.$emit('update-crypto-transaction');
            }).catch((error) => {
              console.error(error)
              Swal.fire("No se pudo eliminar la transacción", "", "error");
            })
          }
        },
        deleteTransaction(transaction) {
          Swal.fire({
            title: 'Eliminar transacción',
            text: '¿Seguro que deseas eliminar esta transacción?',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              if(this.selectedWallet.type !== 'crypto') {
                TransactionService.deleteTransaction(transaction.id).then(() => {
                  this.cancel();
                  this.resetNewTransaction();
                  this.hideEditTransactionMenu();
                  this.$emit('delete-transaction', transaction);
                }).catch((error) => {
                  console.error("error", error)
                  Swal.fire("No se pudo eliminar la transacción", "", "error");
                })
              } else {
                TransactionService.deleteCryptoTransaction(transaction.id).then(() => {
                  this.cancel();
                  this.resetNewTransaction();
                  this.hideEditTransactionMenu();
                  this.$emit('delete-crypto-transaction', transaction);
                }).catch((error) => {
                  console.error("error", error)
                  Swal.fire("No se pudo eliminar la transacción", "", "error");
                })
              }
            }
          })
        },
        cancel() {
          this.transactionSelected = null;
          this.showEditTransactionSection = false;
        },
        blockInvalidChars(input) {
           if (['e', 'E', '+', '-'].includes(input.key)) {
             input.preventDefault();
          }
          // bloquea si ya tiene 9 dígitos
          if (input.target.value.length >= 9 && input.key !== 'Backspace' && input.key !== 'Delete') {
            input.preventDefault();
          }
        }
    },
    mounted() {
      this.getCategories();
      document.addEventListener('click', this.hideEditTransactionMenu);
    },
    unmounted() {
      document.removeEventListener('click', this.hideEditTransactionMenu);
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
        selectedWallet() {
          this.getCategories();
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