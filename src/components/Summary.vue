<template>
  <div class="summary">
    <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">Resumen</h5>
      </div>
      <div class="flow-root">
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
              <div class="basis-1/2 text-right">
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
  props: {
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

    const savingsPercentage = computed(() => {
      const income = Number(props.transactions.totalIncome)
      const savings = Number(props.transactions.savings)
      if (!Number.isFinite(income) || income <= 0 || !Number.isFinite(savings)) return null
      const percentage = (savings / income) * 100
      return Number.isFinite(percentage) ? percentage.toFixed(2) : null
    })

    return {
      totalSavings,
      savingsPercentage,
      formatCurrency
    }
  },
}
</script>