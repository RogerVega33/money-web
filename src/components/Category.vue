<template>
  <div class="category" :aria-busy="isSaving">
    <h6 class="font-semibold">{{title}}</h6>
    <ul class="divide-y divide-gray-200">
      <li class="py-3 sm:py-4" v-for="category in categories" :key="category.id">
        <div class="relative w-full" v-if="categorySelected && category.id === categorySelected.id">
          <input :disabled="isSaving" type="text" id="voice-search" maxlength="50" v-model="categorySelected.name"
                 v-on:keyup.enter="editCategory" v-on:keyup.esc="cancel"
                 class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
          <button type="button" :disabled="isSaving" @click="editCategory" :aria-label="isSaving ? 'Guardando categoría' : 'Guardar categoría'" class="flex absolute inset-y-0 right-6 items-center pr-3 disabled:opacity-75 disabled:cursor-not-allowed">
            <fa :icon="isSaving ? 'spinner' : 'check'" :class="{ 'animate-spin': isSaving }" class="text-green-500"/>
          </button>
          <button type="button" :disabled="isSaving" @click="cancel" aria-label="Cancelar edición" class="flex absolute inset-y-0 right-0 items-center pr-3 disabled:opacity-75 disabled:cursor-not-allowed">
            <fa icon="times" class="text-red-500"/>
          </button>
        </div>
        <div v-else class="flex items-center space-x-4 text-gray-900">
          <div class="flex-shrink-0">
            <fa :icon="icon" :class="iconStyle" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="truncate">
              {{category.name}}
            </p>
          </div>
          <div>
            <button type="button" :disabled="isSaving" @click="selectCategory(category)"
                    aria-label="Editar categoría" class="disabled:opacity-75 disabled:cursor-not-allowed">
              <fa icon="pencil" class="text-sky-500" />
            </button>
          </div>
        </div>
        <template v-if="categorySelected && category.id === categorySelected.id">
          <p v-if="!isSaving && errorMessage" role="alert" class="mt-2 text-sm text-red-500">{{ errorMessage }}</p>
        </template>
      </li>
    </ul>
  </div>
</template>

<script>
import { textError } from '@/utils/dataValidation'
import CategoryService from "../services/category.service";
import { ref } from 'vue';

export default {
  name: 'Category',
  props: {
    categories: Array,
    title: String,
    icon: String,
    iconStyle: String,
  },
  setup(props, { emit }) {
    const categorySelected = ref(null);
    const isSaving = ref(false);
    const errorMessage = ref('');

    const editCategory = async () => {
      if (isSaving.value) return;
      errorMessage.value = textError(categorySelected.value?.name);
      if (errorMessage.value) return;
      isSaving.value = true;
      errorMessage.value = '';
      try {
        await CategoryService.saveCategory({ ...categorySelected.value });
        categorySelected.value = null;
        emit('success');
      } catch (error) {
        errorMessage.value = error.response?.data?.body?.message ||
            error.message || error.toString();
      } finally {
        isSaving.value = false;
      }
    };

    const selectCategory = (category) => {
      if (isSaving.value) return;
      errorMessage.value = '';
      categorySelected.value = Object.assign({}, category);
    };

    const cancel = () => {
      if (isSaving.value) return;
      errorMessage.value = '';
      categorySelected.value = null;
    };

    return {
      isSaving,
      errorMessage,
      categorySelected,
      editCategory,
      selectCategory,
      cancel,
    }
  },
}
</script>