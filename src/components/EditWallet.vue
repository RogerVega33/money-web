<template>
  <div class="edit-wallet">
    <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">Billetera</h5>
      </div>
      <div class="">
        <p>Id: {{selectedWallet.id}}</p>
        <p>Nombre: {{selectedWallet.name}}</p>
        <p v-show="selectedWallet.detail">Detalle: {{selectedWallet.detail}}</p>
        <p>Monto inicial: {{formatCurrency(selectedWallet.startingAmount)}}</p>
      </div>
    </div>

    <div v-if="selectedWallet && selectedWallet.type !=='crypto'" class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">Categorias</h5>
        <fa :icon="showIconNewCategory? 'plus':'xmark'"
            class="cursor-pointer"
            :class="showIconNewCategory? 'text-green-600':'text-red-600'" @click="addCategory"/>
      </div>
      <div class="flow-root" v-if="!showIconNewCategory">
        <h6 class="font-semibold">Nueva categoría</h6>
        <div>
          <div class="mt-2">
            <label for="categoryName">Nombre:</label>
            <br>
            <input id="categoryName" type="text" v-model="newCategory.name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
          </div>
          <div class="mt-2">
            <label>Tipo:</label>
            <br>
            <input type="radio" id="income" value="income" v-model="newCategory.type">
            <label for="income"> Ingreso</label>
            <br>
            <input type="radio" id="expense" value="expense" v-model="newCategory.type">
            <label for="expense"> Gasto</label>
          </div>
          <div class="mt-4">
            <p v-if="errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{errorMessage}}</p>
            <button type="button" @click="saveCategory"
                    class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-500 hover:bg-blue-600">
              Guardar
            </button>
            <button type="button" @click="cancelNewCategory"
                    class="mt-2 text-white font-bold py-2 px-4 rounded-lg w-full bg-gray-500 hover:bg-gray-600">
              Cancelar
            </button>
          </div>
        </div>
      </div>
      <div class="flow-root" v-else>
        <Category icon="arrow-up" icon-style="text-green-600" title="Ingresos" :categories="categories.income" @success="getCategories"/>
        <Category icon="arrow-down" icon-style="text-red-600" title="Gastos" :categories="categories.expense" @success="getCategories"/>
      </div>
    </div>

  </div>
</template>

<script>
import CategoryService from "../services/category.service";
import {ref} from 'vue';
import Category from "../components/Category";
import { formatCurrency } from '../utils/formats';

export default {
  name: 'EditWallet',
  components: {Category},
  props: {
      selectedWallet: Object,
  },
  setup() {
    const categories = ref({income: [], expense: []});
    const showIconNewCategory = ref(true);
    const newCategory = ref({type: 'income'});
    const errorMessage = ref("");
    return{
      categories,
      showIconNewCategory,
      newCategory,
      errorMessage,
    }
  },
  methods: {
    getCategories(){
      CategoryService.getCategories(this.selectedWallet.id).then((response) => {
        this.categories.income = response.data.body.filter(c => c.type === 'income');
        this.categories.expense = response.data.body.filter(c => c.type === 'expense');
      }).catch((error) => {
        console.log(error)
      })
    },
    addCategory(){
      this.showIconNewCategory = !this.showIconNewCategory;
    },
    saveCategory(){
      if(!this.newCategory.name){
        this.errorMessage = "Ingrese el nombre de la categoría";
        return;
      }
      this.newCategory.walletId = this.selectedWallet.id;
      CategoryService.saveCategory(this.newCategory).then(() => {
          this.cancelNewCategory();
          this.getCategories();
      }).catch((error) => {
          this.errorMessage = (error.response &&
            error.response.data &&
            error.response.data.body?.message) ||
            error.message ||
            error.toString()
      })
    },
    cancelNewCategory(){
      this.newCategory = {type: 'income'};
      this.showIconNewCategory = true;
    }
  },
  mounted() {
      this.getCategories();
  },
  watch: {
    selectedWallet(){
      this.getCategories();
    }
  },
  computed: {
    formatCurrency() {
        return formatCurrency;
    }
  },
}
</script>