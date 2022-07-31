<template>
  <div class="category">
    <h6 class="font-semibold">{{title}}</h6>
    <ul class="divide-y divide-gray-200">
      <li class="py-3 sm:py-4" v-for="category in categories" :key="category.id">
        <div class="relative w-full" v-if="categorySelected && category.id === categorySelected.id">
          <input type="text" id="voice-search" v-model="categorySelected.name"
                 v-on:keyup.enter="editCategory" v-on:keyup.esc="cancel"
                 class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
          <button type="button" class="flex absolute inset-y-0 right-6 items-center pr-3">
            <fa icon="check" class="text-green-500 cursor-pointer" @click="editCategory"/>
          </button>
          <button type="button" class="flex absolute inset-y-0 right-0 items-center pr-3">
            <fa icon="times" class="text-red-500 cursor-pointer" @click="cancel"/>
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
            <fa icon="pencil" class="text-sky-500 cursor-pointer" @click="selectCategory(category)" />
          </div>
        </div>
      </li>
    </ul>

  </div>
</template>

<script>
import CategoryService from "../services/category.service";
import {ref} from 'vue';

export default {
  name: 'Category',
  props: {
    categories: Array,
    title: String,
    icon: String,
    iconStyle: String,
  },
  setup() {
    const categorySelected = ref();
    return{
      categorySelected,
    }
  },
  methods: {
    editCategory(){
      if(!this.categorySelected.name){
          this.cancel();
          return;
      }
      CategoryService.saveCategory(this.categorySelected).then(() => {
        this.categorySelected = null;
        this.$emit('success');
      }).catch((error) => {
        console.log(error)
      })
    },
    selectCategory(category){
      this.categorySelected = Object.assign({}, category);
    },
    cancel(){
      this.categorySelected = null;
    },
  },
}
</script>