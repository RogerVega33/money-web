<template>
  <div class="transactions">
    <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4" ref="transactionList">
        <h5 v-if="selectedWallet.type !== 'crypto'" class="text-xl font-bold leading-none text-gray-900">Transacciones
          {{searchSettings.showTransactionsByCategory? 'x categoría' : ''}}</h5>
        <h5 v-else class="text-xl font-bold leading-none text-gray-900">Holdings</h5>
        <div>
          <fa icon="download" v-if="transactions?.transactions?.length > 0"
              class="cursor-pointer text-blue-500 mr-3"
              title="Descargar CSV"
              @click="downloadTransactions"/>
          <fa :icon="showIconNewTransaction? 'plus':'xmark'"
              class="cursor-pointer"
              title="Nueva transacción"
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
                   @keydown.enter="$refs.saveBtn.click()"
                   class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   required>
          </div>
          <div class="mt-2">
            <label for="transactionAmount">Monto:</label>
            <br>
            <input id="transactionAmount" type="number" v-model="newTransaction.amount" placeholder="$ 0.00"
                   @keydown="blockInvalidChars"
                   @keydown.enter="$refs.saveBtn.click()"
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
            <button ref="saveBtn" type="button" @click="saveTransaction"
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
                   @keydown.enter="$refs.saveCryptoBtn.click()"
                   class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   required>
          </div>
          <div class="mt-4">
            <p v-if="errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{errorMessage}}</p>
            <button ref="saveCryptoBtn" type="button" @click="saveTransaction"
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
          <li class="py-3 sm:py-4" v-for="category in paginatedCategories"
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
                <li class="py-3 sm:py-4" v-for="transaction in paginatedCategoryTransactions(category)" :key="transaction.id">
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
                             @keydown.enter="$refs.editBtn[0].click()"
                             placeholder="Detalle"
                             class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                             required>
                    </div>
                    <div class="mt-2">
                      <label for="transactionAmount">Monto:</label>
                      <br>
                      <input id="transactionAmount" type="number" v-model="transactionSelected.amount" placeholder="$ 0.00"
                             @keydown="blockInvalidChars"
                             @keydown.enter="$refs.editBtn[0].click()"
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
                      <button ref="editBtn" type="button" @click="updateTransaction(transactionSelected)"
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
                        <span class="font-bold text-xs">{{getTransactionDate(transaction.date)}}</span> | {{transaction.detail
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
              <!-- Paginación del detalle -->
              <div v-if="categoryTotalPages(category) > 1" class="flex justify-center items-center gap-2 mt-3">
                <button
                    @click="category.currentPage--"
                    :disabled="category.currentPage <= 1"
                    class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40">
                  ‹
                </button>
                <span class="text-sm text-gray-600">
                  {{ category.currentPage }} / {{ categoryTotalPages(category) }}
                </span>
                <button
                    @click="category.currentPage++"
                    :disabled="category.currentPage >= categoryTotalPages(category)"
                    class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40">
                  ›
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <!-- Lista de transacciones sin agrupar -->
      <div v-else class="flow-root">
        <ul v-if="selectedWallet.type !== 'crypto'" role="list" class="divide-y divide-gray-200">
          <li class="py-3 sm:py-4" v-for="transaction in paginatedTransactions" :key="transaction.id">
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
                  <span class="font-bold text-xs">{{getTransactionDate(transaction.date)}}</span>  | {{transaction.detail || 'Sin detalle'}}
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
      <!-- Paginación -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-4">
        <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40">
          ‹
        </button>
        <span class="text-sm text-gray-600">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40">
          ›
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, watch, computed, onMounted, onUnmounted, nextTick} from 'vue';
import moment from 'moment'
import CategoryService from "../services/category.service";
import TransactionService from "../services/transaction.service";
import { formatCurrency, formatCryptoHoldings, formatDateTime } from '@/utils/formats';
import { exportToCSV } from '@/utils/exportCSV';
import Swal from 'sweetalert2'

export default {
  name: 'Transactions',
  props: {
    searchSettings: Object,
    transactionsByCategory: Array,
    transactions: Object,
    selectedWallet: Object,
  },
  setup(props, { emit }) {

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
    const currentPage = ref(1)
    const pageSize = 10
    const transactionList = ref(null)

    function getTransactionDate(transactionDate) {
      return moment.utc(String(transactionDate)).format('DD/MM/yy')
    }

    function showDetail(category) {
      category.showDetail = !category.showDetail;
      if (!category.currentPage) category.currentPage = 1;
    }

    function addTransaction(transaction) {
      resetNewTransaction();
      if(transaction && transaction.id) {
        hideEditTransactionMenu();
        newTransaction.value.categoryId = transaction.categoryId;
        newTransaction.value.amount = transaction.amount;
        newTransaction.value.detail = transaction.detail;
        newTransaction.value.date = null;
        showIconNewTransaction.value = false;
        return;
      }
      showIconNewTransaction.value = !showIconNewTransaction.value;
    }

    function saveTransaction() {
      errorMessage.value = '';
      if(props.selectedWallet.type !== 'crypto') {
        if (!newTransaction.value.date || !newTransaction.value.amount || !newTransaction.value.categoryId) return;
        const payload = {
          ...newTransaction.value,
          date: moment(newTransaction.value.date).format('YYYY-MM-DD')
        };
        TransactionService.saveTransaction(payload).then(() => {
          cancelNewTransaction();
          emit('new-transaction');
        }).catch((error) => {
          errorMessage.value = (error.response &&
                  error.response.data &&
                  error.response.data.body?.message) ||
              error.message ||
              error.toString()
        })
      } else {
        if (!newCryptoTransaction.value.symbol || !newCryptoTransaction.value.amount) return;
        newCryptoTransaction.value.walletId = props.selectedWallet.id;
        TransactionService.saveCryptoTransaction(newCryptoTransaction.value).then(() => {
          cancelNewTransaction();
          emit('new-crypto-transaction');
        }).catch((error) => {
          errorMessage.value = (error.response &&
                  error.response.data &&
                  error.response.data.body?.message) ||
              error.message ||
              error.toString()
        })
      }
    }

    function resetNewTransaction() {
      errorMessage.value = '';
      newTransaction.value = {categoryId: null, date: new Date(), detail: null, amount: null};
      newCryptoTransaction.value = {};
    }

    function cancelNewTransaction(){
      resetNewTransaction();
      showIconNewTransaction.value = true;
    }

    function getCategories() {
      CategoryService.getCategories(props.selectedWallet.id).then((response) => {
        const incomes = response.data.body.filter(c => c.type === 'income');
        const expenses = response.data.body.filter(c => c.type === 'expense');
        categories.value = [{category: 'Ingresos', categoryList: incomes}, {category: 'Gastos', categoryList: expenses}];
      }).catch((error) => {
        console.log(error)
      })
    }

    function toggleMenu(id) {
      openMenuId.value = openMenuId.value === id ? null : id;
    }

    function hideEditTransactionMenu(){
      openMenuId.value = null;
    }

    function showEditTransaction(transaction) {
      hideEditTransactionMenu();
      transactionSelected.value = Object.assign({}, transaction);
      showEditTransactionSection.value = true;
    }

    function updateTransaction(transaction) {
      if(props.selectedWallet.type !== 'crypto') {
        transaction.date = moment(transaction.date).format('YYYY-MM-DD');
        TransactionService.updateTransaction(transaction).then(() => {
          cancel();
          resetNewTransaction();
          emit('update-transaction');
        }).catch((error) => {
          console.error(error)
          Swal.fire("No se pudo editar la transacción", "", "error");
        })
      } else {
        TransactionService.updateCryptoTransaction(transaction).then(() => {
          cancel();
          resetNewTransaction();
          emit('update-crypto-transaction');
        }).catch((error) => {
          console.error(error)
          Swal.fire("No se pudo editar la transacción", "", "error");
        })
      }
    }

    function deleteTransaction(transaction) {
      Swal.fire({
        title: 'Eliminar transacción',
        text: '¿Seguro que deseas eliminar esta transacción?',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          if(props.selectedWallet.type !== 'crypto') {
            TransactionService.deleteTransaction(transaction.id).then(() => {
              cancel();
              resetNewTransaction();
              hideEditTransactionMenu();
              emit('delete-transaction', transaction);
            }).catch((error) => {
              console.error("error", error)
              Swal.fire("No se pudo eliminar la transacción", "", "error");
            })
          } else {
            TransactionService.deleteCryptoTransaction(transaction.id).then(() => {
              cancel();
              resetNewTransaction();
              hideEditTransactionMenu();
              emit('delete-crypto-transaction', transaction);
            }).catch((error) => {
              console.error("error", error)
              Swal.fire("No se pudo eliminar la transacción", "", "error");
            })
          }
        }
      })
    }

    function cancel() {
      transactionSelected.value = null;
      showEditTransactionSection.value = false;
    }

    function blockInvalidChars(input) {
      // Bloquea caracteres inválidos incluyendo notación científica
      if (['e', 'E', '+', '-'].includes(input.key)) {
        input.preventDefault();
      }
      const navigationKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'];
      // Bloquea si ya tiene 9 dígitos
      if (input.target.value.length >= 9 && !navigationKeys.includes(input.key)) {
        input.preventDefault();
      }
    }

    function downloadTransactions(){
      exportToCSV(props.transactions?.transactions)
    }

    function paginatedCategoryTransactions(category) {
      const pageSize = 10
      const start = ((category.currentPage || 1) - 1) * pageSize
      return category.transactions.slice(start, start + pageSize)
    }

    function categoryTotalPages(category) {
      return Math.ceil(category.transactions.length / 10)
    }

    onMounted(() => {
      getCategories();
      document.addEventListener('click', hideEditTransactionMenu);
    });

    onUnmounted(() => {
      document.removeEventListener('click', hideEditTransactionMenu);
    });

    watch(transactionFilter, () => {
      currentPage.value = 1;
      emit('update-transaction-filter', transactionFilter.value);
    });

    watch(() => props.searchSettings, () => {
      transactionFilter.value = "";
      currentPage.value = 1;
    }, { deep: true });

    watch(() => props.selectedWallet, () => {
      getCategories();
    });

    watch(currentPage, async () => {
      // Cierra el detalle de las categorías abiertas y reinicia su paginación
      props.transactionsByCategory?.forEach(category => {
        category.showDetail = false
        category.currentPage = 1
      })
      // Hace un desplazamiento al inicio de las transacciones
      await nextTick()
      transactionList.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    });

    const paginatedTransactions = computed(() => {
      if (!props.transactions?.transactions) return []
      const start = (currentPage.value - 1) * pageSize
      return props.transactions.transactions.slice(start, start + pageSize)
    });

    const paginatedCategories = computed(() => {
      if (!props.transactionsByCategory) return []
      const start = (currentPage.value - 1) * pageSize
      return props.transactionsByCategory.slice(start, start + pageSize)
    });

    const totalPages = computed(() => {
      const total = props.searchSettings.showTransactionsByCategory
          ? props.transactionsByCategory?.length
          : props.transactions?.transactions?.length
      return Math.ceil((total || 0) / pageSize)
    });

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
      currentPage,
      pageSize,
      transactionList,

      getTransactionDate,
      showDetail,
      addTransaction,
      saveTransaction,
      cancelNewTransaction,
      toggleMenu,
      showEditTransaction,
      updateTransaction,
      deleteTransaction,
      cancel,
      blockInvalidChars,
      downloadTransactions,
      paginatedCategoryTransactions,
      categoryTotalPages,

      formatCurrency,
      formatCryptoHoldings,
      formatDateTime,

      paginatedTransactions,
      paginatedCategories,
      totalPages
    }
  }
}
</script>