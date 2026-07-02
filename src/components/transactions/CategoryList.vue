<template>

  <div class="flow-root">

    <div v-if="categories && categories.length">
      <ul role="list" class="divide-y divide-gray-200">
        <CategoryItem
            v-for="category in transactionsByCategory"
            :key="category.categoryName + category.total"
            :category="category"
            :categories="categories"
            :transactions-by-category="transactionsByCategory"
            :transaction-selected="transactionSelected"
            :show-edit="showEdit"
            :saving="saving"
            @new="$emit('new', $event)"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
            @update="$emit('update', $event)"
            @cancel-edit="$emit('cancel-edit')"
        />
      </ul>
    </div>

  </div>

</template>

<script setup>
import CategoryItem from './CategoryItem.vue'

defineProps({
  categories: Array,
  transactionsByCategory: Array,
  transactionSelected: Object,
  showEdit: Boolean,
  saving: Boolean,
})

</script>