<template>
  <div class="edit-wallet">
    <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">Billetera</h5>
        <button type="button" :disabled="isSavingWallet" @click="toggleWalletEdit"
                :aria-label="isEditingWallet ? 'Cerrar' : 'Editar'" class="disabled:opacity-75 disabled:cursor-not-allowed">
          <fa :icon="isEditingWallet ? 'xmark' : 'pencil'" :class="isEditingWallet ? 'text-red-600' : 'text-sky-500'" />
        </button>
      </div>
      <form v-if="isEditingWallet" :aria-busy="isSavingWallet" @submit.prevent="saveWallet">
        <h6 class="font-semibold mb-4">Editar billetera</h6>
        <div>
          <label for="editWalletName" class="block text-grey-darker text-sm font-medium mb-2">Nombre</label>
          <input id="editWalletName" v-model="walletDraft.name" :disabled="isSavingWallet" type="text" maxlength="50" required
                 class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker">
        </div>
        <div class="mt-4">
          <label for="editWalletDetail" class="block text-grey-darker text-sm font-medium mb-2">Descripción</label>
          <input id="editWalletDetail" v-model="walletDraft.detail" :disabled="isSavingWallet" type="text" maxlength="150" placeholder="Opcional"
                 class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker">
        </div>
        <div v-if="selectedWallet.type === 'fiat'" class="mt-4">
          <label for="editWalletAmount" class="block text-grey-darker text-sm font-medium mb-2">Monto inicial</label>
          <input id="editWalletAmount" v-model="walletDraft.startingAmount" :disabled="isSavingWallet" type="text" inputmode="decimal" maxlength="16" placeholder="$ 0.00"
                 @keydown="blockInvalidChars" @beforeinput="blockInvalidAmountInput" @paste="handleAmountPaste" @drop.prevent
                 class="shadow appearance-none border rounded-lg w-full py-2 px-3 text-grey-darker">
        </div>
        <div class="mt-4">
          <label for="editWalletExclude" class="relative inline-flex items-center mb-4 cursor-pointer">
            <input type="checkbox" id="editWalletExclude" class="sr-only peer" v-model="walletDraft.excludeFromTotal" :disabled="isSavingWallet">
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Excluir del total</span>
          </label>
        </div>
        <div class="mt-4">
          <label for="editWalletArchived" class="relative inline-flex items-center mb-4 cursor-pointer">
            <input type="checkbox" id="editWalletArchived" class="sr-only peer" v-model="walletDraft.isArchived" :disabled="isSavingWallet">
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Archivar billetera</span>
          </label>
        </div>
        <div class="mt-4">
          <p v-if="walletError" role="alert" class="text-red-500 text-xs italic mt-2 mb-2">{{ walletError }}</p>
          <button type="submit" :disabled="isSavingWallet" :aria-label="isSavingWallet ? 'Guardando billetera' : 'Guardar billetera'"
                  class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:bg-blue-500">
            <template v-if="isSavingWallet">Guardando<LoadingDots /></template>
            <template v-else>Guardar</template>
          </button>
          <button type="button" :disabled="isSavingWallet" @click="cancelWalletEdit"
                  class="mt-2 text-white font-bold py-2 px-4 rounded-lg w-full bg-gray-500 hover:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:bg-gray-500">Cancelar</button>
        </div>
      </form>
      <div v-else>
        <p>Nombre: {{selectedWallet.name}}</p>
        <p v-show="selectedWallet.detail">Detalle: {{selectedWallet.detail}}</p>
        <p v-if="selectedWallet.type !=='crypto'">Monto inicial: {{formatCurrency(selectedWallet.startingAmount)}}</p>
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
            <input :disabled="isSavingCategory" id="categoryName" type="text" maxlength="50" v-model="newCategory.name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5" required>
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
import { blockInvalidChars, blockInvalidAmountInput, handleAmountPaste } from '@/utils/inputValidation'
import WalletService from '@/services/wallet.service'
import { amountError, textError } from '@/utils/dataValidation'
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
  emits: ['success'],
  setup(props, { emit }) {
    const isEditingWallet = ref(false);
    const isSavingWallet = ref(false);
    const walletDraft = ref({});
    const walletError = ref('');
    let walletEditVersion = 0;

    const resetWalletEdit = () => {
      walletEditVersion++;
      isEditingWallet.value = false;
      walletDraft.value = {};
      walletError.value = '';
    };
    const cancelWalletEdit = () => {
      if (!isSavingWallet.value) resetWalletEdit();
    };
    const toggleWalletEdit = () => {
      if (isSavingWallet.value) return;
      if (isEditingWallet.value) return cancelWalletEdit();
      walletDraft.value = {
        name: props.selectedWallet.name,
        detail: props.selectedWallet.detail ?? '',
        excludeFromTotal: props.selectedWallet.excludeFromTotal ?? false,
        isArchived: props.selectedWallet.isArchived ?? false,
        startingAmount: String(props.selectedWallet.startingAmount ?? 0),
      };
      walletError.value = '';
      isEditingWallet.value = true;
    };
    const saveWallet = async () => {
      if (isSavingWallet.value) return;
      const fiat = props.selectedWallet.type === 'fiat';
      walletError.value = textError(walletDraft.value.name) ||
          textError(walletDraft.value.detail, 'La descripción', 150, true) ||
          (fiat ? amountError(walletDraft.value.startingAmount || '0', false, true) : '');
      if (walletError.value) return;
      const payload = { id: props.selectedWallet.id, name: walletDraft.value.name.trim(), detail: walletDraft.value.detail.trim(),
        excludeFromTotal: walletDraft.value.excludeFromTotal, isArchived: walletDraft.value.isArchived };
      if (fiat) payload.startingAmount = walletDraft.value.startingAmount || '0';
      const version = walletEditVersion;
      isSavingWallet.value = true;
      try {
        await WalletService.updateWallet(payload);
        if (version === walletEditVersion) resetWalletEdit();
        emit('success');
      } catch (error) {
        if (version !== walletEditVersion) return;
        walletError.value = error.response?.data?.body?.message || error.message || error.toString();
      } finally {
        isSavingWallet.value = false;
      }
    };

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
      errorMessage.value = textError(newCategory.value.name);
      if (errorMessage.value) return;
      if (!['income', 'expense'].includes(newCategory.value.type)) {
        errorMessage.value = 'Seleccione Ingreso o Gasto.';
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
      resetWalletEdit();
      resetNewCategory();
      getCategories();
    }, { immediate: true });

    return {
      isEditingWallet, isSavingWallet, walletDraft, walletError,
      toggleWalletEdit, cancelWalletEdit, saveWallet,
      blockInvalidChars, blockInvalidAmountInput, handleAmountPaste,
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