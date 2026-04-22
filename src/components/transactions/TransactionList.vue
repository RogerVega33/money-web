<template>
  <div class="flow-root">

    <!-- AGRUPADO -->
    <div v-if="searchSettings.showTransactionsByCategory && wallet.type !== 'crypto'">
      <CategoryList
          :categories="categories"
          :transactions-by-category="transactionsByCategory"
          :transaction-selected="transactionSelected"
          :show-edit="showEdit"
          @new="$emit('new', $event)"
          @edit="$emit('edit', $event)"
          @update="$emit('update', $event)"
          @cancel-edit="$emit('cancel-edit')"
          @delete="$emit('delete', $event)"
      />
    </div>

    <!-- NORMAL -->
    <div v-else>
      <ul role="list" class="divide-y divide-gray-200">

        <li
            v-for="transaction in transactions.transactions"
            :key="transaction.id"
            class="py-3 sm:py-4"
        >

          <!-- FIAT -->
          <TransactionItemFiat
              v-if="wallet.type !== 'crypto'"
              :transaction="transaction"
              :transaction-selected="transactionSelected"
              :show-edit="showEdit"
              :categories="categories"
              @new="$emit('new', $event)"
              @edit="$emit('edit', $event)"
              @delete="$emit('delete', $event)"
              @update="$emit('update', $event)"
              @cancel-edit="$emit('cancel-edit')"
          />

          <!-- CRYPTO -->
          <TransactionItemCrypto
              v-else
              :transaction="transaction"
              :transaction-selected="transactionSelected"
              :show-edit="showEdit"
              @edit="$emit('edit', $event)"
              @delete="$emit('delete', $event)"
              @update="$emit('update', $event)"
              @cancel-edit="$emit('cancel-edit')"
          />

        </li>

      </ul>
    </div>

  </div>
</template>

<script setup>
import TransactionItemFiat from './TransactionItemFiat.vue'
import TransactionItemCrypto from './TransactionItemCrypto.vue'
import CategoryList from './CategoryList.vue'

defineProps([
  'transactions',
  'transactionsByCategory',
  'searchSettings',
  'wallet',
  'transactionSelected',
  'showEdit',
  'openMenuId',
  'categories'
])
</script>