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
        <button type="button" :disabled="isSavingCategory" @click="addCategory"
                :aria-label="showIconNewCategory ? 'Agregar categoría' : 'Cerrar nueva categoría'"
                class="disabled:opacity-75 disabled:cursor-not-allowed">
          <fa :icon="showIconNewCategory ? 'plus' : 'xmark'"
              :class="showIconNewCategory ? 'text-green-600' : 'text-red-600'"/>
        </button>
      </div>
      <div class="flow-root" v-if="!showIconNewCategory" :aria-busy="isSavingCategory">
        <h6 class="font-semibold">Nueva categoría</h6>
        <div>
          <div class="mt-2">
            <label for="categoryName">Nombre:</label>
            <br>
            <input :disabled="isSavingCategory" id="categoryName" type="text" v-model="newCategory.name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5" required>
          </div>
          <div class="mt-2">
            <label>Tipo:</label>
            <br>
            <input :disabled="isSavingCategory" type="radio" id="income" value="income" v-model="newCategory.type">
            <label for="income"> Ingreso</label>
            <br>
            <input :disabled="isSavingCategory" type="radio" id="expense" value="expense" v-model="newCategory.type">
            <label for="expense"> Gasto</label>
          </div>
          <div class="mt-4">
            <p v-if="errorMessage" class="text-red-500 text-xs italic mt-2 mb-2">{{errorMessage}}</p>
            <button type="button" @click="saveCategory" :disabled="isSavingCategory"
                    :aria-label="isSavingCategory ? 'Guardando categoría' : 'Guardar categoría'"
                    class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:bg-blue-500">
              <template v-if="isSavingCategory">Guardando<LoadingDots /></template>
              <template v-else>Guardar</template>
            </button>
            <button type="button" @click="cancelNewCategory" :disabled="isSavingCategory"
                    class="mt-2 text-white font-bold py-2 px-4 rounded-lg w-full bg-gray-500 hover:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:bg-gray-500">
              Cancelar
            </button>
          </div>
        </div>
      </div>
      <div class="flow-root" v-else :aria-busy="loadingCategories">
        <p v-if="loadingCategories" class="text-gray-600" role="status">Cargando categorías<LoadingDots /></p>
        <div v-else-if="categoriesError" role="alert"><p>No se pudieron cargar las categorías.</p><button type="button" class="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500" @click="getCategories">Reintentar</button></div>
        <p v-else-if="!categories.income.length && !categories.expense.length" class="text-gray-600">Todavía no tienes categorías en esta billetera. Usa el botón + para agregar una.</p>
        <template v-else>
        <Category icon="arrow-up" icon-style="text-green-600" title="Ingresos" :categories="categories.income" @success="getCategories"/>
        <Category icon="arrow-down" icon-style="text-red-600" title="Gastos" :categories="categories.expense" @success="getCategories"/>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingDots from '@/components/common/LoadingDots.vue'
import { ref, watch } from 'vue';
import { useLatestRequest } from '@/composables/useLatestRequest';
import CategoryService from "../services/category.service";
import Category from "../components/Category";
import { formatCurrency } from '../utils/formats';

export default {
  name: 'EditWallet',
  components: { Category, LoadingDots },
  props: {
    selectedWallet: Object,
  },
  setup(props) {
    const categories = ref({ income: [], expense: [] });
    const categoriesRequest = useLatestRequest();
    const showIconNewCategory = ref(true);
    const newCategory = ref({ type: 'income' });
    const errorMessage = ref("");
    const isSavingCategory = ref(false);

    const getCategories = () => {
      categories.value = { income: [], expense: [] };
      categoriesRequest.invalidate();
      if (!props.selectedWallet?.id || props.selectedWallet.type === 'crypto') return;
      const walletId = props.selectedWallet.id;
      return categoriesRequest.run(() => CategoryService.getCategories(walletId), (response) => {
        categories.value.income = response.data.body.filter(c => c.type === 'income');
        categories.value.expense = response.data.body.filter(c => c.type === 'expense');
      })
    };

    const addCategory = () => {
      if (isSavingCategory.value) return;
      showIconNewCategory.value = !showIconNewCategory.value;
    };

    const saveCategory = async () => {
      if (isSavingCategory.value) return;
      if (!newCategory.value.name) {
        errorMessage.value = "Ingrese el nombre de la categoría";
        return;
      }
      isSavingCategory.value = true;
      errorMessage.value = '';
      const walletId = props.selectedWallet.id;

      try {
        await CategoryService.saveCategory({ ...newCategory.value, walletId });
        if (props.selectedWallet.id !== walletId) return;
        resetNewCategory();
        getCategories();
      } catch (error) {
        if (props.selectedWallet.id !== walletId) return;
        errorMessage.value = error.response?.data?.body?.message ||
            error.message ||
            error.toString();
      } finally {
        isSavingCategory.value = false;
      }
    };

    const resetNewCategory = () => {
      newCategory.value = { type: 'income' };
      showIconNewCategory.value = true;
      errorMessage.value = "";
    };

    const cancelNewCategory = () => {
      if (isSavingCategory.value) return;
      resetNewCategory();
    };

    watch(() => props.selectedWallet?.id, () => {
      resetNewCategory();
      getCategories();
    }, { immediate: true });

    return {
      isSavingCategory,
      loadingCategories: categoriesRequest.loading,
      categoriesError: categoriesRequest.error,
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