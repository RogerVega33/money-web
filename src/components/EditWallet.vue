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
            <input id="categoryName" type="text" v-model="newCategory.name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5" required>
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
import { ref, onMounted, watch } from 'vue';
import CategoryService from "../services/category.service";
import Category from "../components/Category";
import { formatCurrency } from '../utils/formats';

export default {
  name: 'EditWallet',
  components: { Category },
  props: {
    selectedWallet: Object,
  },
  setup(props) {
    const categories = ref({ income: [], expense: [] });
    const showIconNewCategory = ref(true);
    const newCategory = ref({ type: 'income' });
    const errorMessage = ref("");

    const getCategories = () => {
      if (!props.selectedWallet?.id) return;

      CategoryService.getCategories(props.selectedWallet.id).then((response) => {
        categories.value.income = response.data.body.filter(c => c.type === 'income');
        categories.value.expense = response.data.body.filter(c => c.type === 'expense');
      }).catch((error) => {
        console.log(error)
      })
    };

    const addCategory = () => {
      showIconNewCategory.value = !showIconNewCategory.value;
    };

    const saveCategory = () => {
      if (!newCategory.value.name) {
        errorMessage.value = "Ingrese el nombre de la categoría";
        return;
      }
      newCategory.value.walletId = props.selectedWallet.id;

      CategoryService.saveCategory(newCategory.value).then(() => {
        cancelNewCategory();
        getCategories();
      }).catch((error) => {
        errorMessage.value = (error.response &&
                error.response.data &&
                error.response.data.body?.message) ||
            error.message ||
            error.toString()
      })
    };

    const cancelNewCategory = () => {
      newCategory.value = { type: 'income' };
      showIconNewCategory.value = true;
      errorMessage.value = "";
    };

    onMounted(() => {
      getCategories();
    });

    watch(() => props.selectedWallet, () => {
      getCategories();
    });

    return {
      categories,
      showIconNewCategory,
      newCategory,
      errorMessage,
      getCategories,
      addCategory,
      saveCategory,
      cancelNewCategory,
      formatCurrency,
    }
  },
}
</script>