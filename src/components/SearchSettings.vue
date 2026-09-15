<template>
  <div class="search-settings">
    <div class="w-full mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">Configuración</h5>
      </div>
      <div class="flow-root">
        <template v-if="selectedWallet && selectedWallet.type !== 'crypto'">
          <div>
            <label>Buscar por:</label>
            <br>
            <input type="radio" id="month" value="month" v-model="searchSettings.dateRangePicked">
            <label for="month"> Mes</label>
            <br>
            <input type="radio" id="year" value="year" v-model="searchSettings.dateRangePicked">
            <label for="year"> Año</label>
            <br>
            <input type="radio" id="all" value="all" v-model="searchSettings.dateRangePicked">
            <label for="all"> Histórico</label>
          </div>
          <div v-if="searchSettings.dateRangePicked !== 'all'" class="mt-2">
            <Datepicker v-model="searchSettings.dateSelected" monthPicker autoApply :year-range="yearRange" :min-date="minDate" :max-date="maxDate" preventMinMaxNavigation v-if="searchSettings.dateRangePicked === 'month'"/>
            <Datepicker v-model="searchSettings.dateSelected.year" yearPicker autoApply :year-range="yearRange" :min-date="minDate" :max-date="maxDate" preventMinMaxNavigation v-if="searchSettings.dateRangePicked === 'year'"/>
          </div>
          <div class="mt-4">
            <label for="checked-toggle" class="relative inline-flex items-center mb-4 cursor-pointer">
              <input type="checkbox" value="" id="checked-toggle" class="sr-only peer" v-model="searchSettings.showTransactionsByCategory">
              <div class="relative shrink-0 w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Mostrar transacciones por categoría</span>
            </label>
          </div>
        </template>

        <div class="mt-2">
          <label for="showArchivedWallets" class="relative inline-flex items-center mb-4 cursor-pointer">
            <input type="checkbox" id="showArchivedWallets" class="sr-only peer" :checked="showArchivedWallets" @change="$emit('update:showArchivedWallets', $event.target.checked)">
            <div class="relative shrink-0 w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Mostrar billeteras archivadas</span>
          </label>
        </div>
        <div class="mt-2">
          <label for="checked-toggle-2" class="relative inline-flex items-center mb-4 cursor-pointer">
            <input type="checkbox" value="" id="checked-toggle-2" class="sr-only peer" v-model="hideMoney">
            <div class="relative shrink-0 w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Ocultar dinero</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import store from '../store'

export default {
  name: 'SearchSettings',
  props: {
    selectedWallet: Object,
    showArchivedWallets: Boolean,
  },
  setup(props, { emit }) {
    const maxYear = new Date().getFullYear() + 1
    const yearRange = [2000, maxYear]
    const minDate = new Date(2000, 0, 1)
    const maxDate = new Date(maxYear, 11, 31)

    const searchSettings = ref({
      dateSelected: {
        month: new Date().getMonth(),
        year: new Date().getFullYear()
      },
      dateRangePicked: "month",
      showTransactionsByCategory: true
    });

    const hideMoney = ref(store.state.app.hideMoney)

    const changeSearchSettings = () => {
      emit('change-search-settings', searchSettings.value)
    }

    watch(searchSettings, () => {
      changeSearchSettings()
    }, { deep: true })

    watch(hideMoney, (newData) => {
      store.commit('app/SET_HIDE_MONEY', newData)
    })

    return {
      yearRange, minDate, maxDate,
      searchSettings,
      hideMoney,
    }
  },
}
</script>