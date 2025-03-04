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
            <div class="flex flex-row" v-if="!Number.isNaN(+savingsPercentage)">
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
import { formatCurrency } from '../utils/formats';

export default {
  name: 'Summary',
  props: {
    selectedWallet: Object,
    transactions: Object,
    showStartingAmount: Boolean,
  },
  computed: {
    totalSavings(){
      if(this.transactions.savings && this.selectedWallet.startingAmount){
        if(this.showStartingAmount)
          return (+this.transactions.savings + +this.selectedWallet.startingAmount).toFixed(2);
        return (+this.transactions.savings).toFixed(2);
      }
      return (0).toFixed(2);
    },
    savingsPercentage(){
      return ((+this.transactions.savings * 100)/+this.transactions.totalIncome).toFixed(2);
    },
    formatCurrency() {
        return formatCurrency;
    }
  },
}
</script>