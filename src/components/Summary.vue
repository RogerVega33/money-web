<template>
  <div class="summary">
    <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center gap-2 mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">{{ title }}</h5>
        <div v-if="navigationUnit" class="flex shrink-0 items-center gap-2">
          <button type="button" :disabled="!canPrevious" :aria-label="`${navigationUnit} anterior`" :title="`${navigationUnit} anterior`"
                  class="text-gray-600 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed" @click="$emit('change-period', -1)">
            <fa icon="chevron-left" />
          </button>
          <button type="button" :disabled="!canNext" :aria-label="`${navigationUnit} siguiente`" :title="`${navigationUnit} siguiente`"
                  class="text-gray-600 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed" @click="$emit('change-period', 1)">
            <fa icon="chevron-right" />
          </button>
        </div>
      </div>
      <p v-if="empty" class="text-gray-600">No hay movimientos en este período.</p>
      <div v-else class="flow-root">
        <div class="flex space-x-4 text-gray-900">
          <div class="font-medium w-full">
            <div class="flex flex-row" v-if="selectedWallet && showStartingAmount">
              <div class="basis-1/2">
                Monto inicial
              </div>
              <div class="basis-1/2 text-right">
                {{formatCurrency(selectedWallet.startingAmount || '0.0')}}
              </div>
            </div>
            <div class="flex flex-row">
              <div class="basis-1/2">
                Ingresos
              </div>
              <div class="basis-1/2 text-right">
                {{formatCurrency(transactions.totalIncome || '0.0')}}
              </div>
            </div>
            <div class="flex flex-row">
              <div class="basis-1/2">
                Gastos
              </div>
              <div class="basis-1/2 text-right">
                {{formatCurrency(transactions.totalExpense || '0.0')}}
              </div>
            </div>
            <hr/>
            <div class="flex flex-row">
              <div class="basis-1/2">
                Ahorro
              </div>
              <div class="basis-1/2 text-right" :class="savingsColor">
                {{formatCurrency(totalSavings)}}
              </div>
            </div>
            <div class="flex flex-row" v-if="savingsPercentage !== null">
              <div class="basis-1/2">
                Porcentaje de ahorro
              </div>
              <div class="basis-1/2 text-right">
                {{savingsPercentage}} %
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { formatCurrency } from '../utils/formats'

export default {
  name: 'Summary',
  emits: ['change-period'],
  props: {
    title: { type: String, default: 'Resumen' },
    navigationUnit: { type: String, default: '' },
    canPrevious: Boolean,
    canNext: Boolean,
    empty: Boolean,
    selectedWallet: Object,
    transactions: Object,
    showStartingAmount: Boolean,
  },
  setup(props) {

    const totalSavings = computed(() => {
      const savings = Number(props.transactions.savings ?? 0)
      const startingAmount = props.showStartingAmount ? Number(props.selectedWallet.startingAmount ?? 0) : 0
      return (savings + startingAmount).toFixed(2)
    })

    const savingsColor = computed(() => {
      const savings = Number(totalSavings.value)
      return savings > 0 ? 'text-green-500' : savings < 0 ? 'text-red-500' : 'text-black'
    })

    const savingsPercentage = computed(() => {
      const income = Number(props.transactions.totalIncome)
      const savings = Number(props.transactions.savings)
      if (!Number.isFinite(income) || income <= 0 || !Number.isFinite(savings)) return null
      const percentage = (savings / income) * 100
      return Number.isFinite(percentage) ? percentage.toFixed(2) : null
    })

    return {
      totalSavings,
      savingsColor,
      savingsPercentage,
      formatCurrency
    }
  },
}
</script>
