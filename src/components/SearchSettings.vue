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
            <input type="radio" id="range" value="range" v-model="searchSettings.dateRangePicked">
            <label for="range"> Rango</label>
            <br>
            <input type="radio" id="all" value="all" v-model="searchSettings.dateRangePicked">
            <label for="all"> Histórico</label>
          </div>
          <div v-if="searchSettings.dateRangePicked !== 'all'" class="mt-2">
            <Datepicker :model-value="searchSettings.dateSelected" @update:model-value="updateSelectedMonth" :clearable="false" monthPicker autoApply v-bind="calendarProps" v-if="searchSettings.dateRangePicked === 'month'"/>
            <Datepicker :model-value="searchSettings.dateSelected.year" @update:model-value="updateSelectedYear" :clearable="false" yearPicker autoApply v-bind="calendarProps" v-if="searchSettings.dateRangePicked === 'year'"/>
          </div>
          <div v-if="searchSettings.dateRangePicked === 'range'" class="mt-2">
            <Datepicker :model-value="searchSettings.monthRange" @update:model-value="updateMonthRange"
                        monthPicker range autoApply :partial-range="false" :clearable="false"
                        format="MM/yyyy" v-bind="calendarProps" />
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
import { calendarProps, isCalendarYear } from '@/config/calendar'

export default {
  name: 'SearchSettings',
  props: {
    settings: { type: Object, required: true },
    selectedWallet: Object,
    showArchivedWallets: Boolean,
  },
  setup(props, { emit }) {
    const searchSettings = ref(props.settings);
    const updateSelectedMonth = value => {
      if (!value || !isCalendarYear(value.year) || value.month === null || value.month === undefined || value.month === '' ||
          !Number.isInteger(Number(value.month)) || Number(value.month) < 0 || Number(value.month) > 11) return
      searchSettings.value.dateSelected = { year: Number(value.year), month: Number(value.month) }
    }

    const updateSelectedYear = value => {
      if (!isCalendarYear(value)) return
      searchSettings.value.dateSelected = { ...searchSettings.value.dateSelected, year: Number(value) }
    }

    const updateMonthRange = value => {
      if (!Array.isArray(value) || value.length !== 2 || !value.every(date => date &&
          isCalendarYear(date.year) &&
          Number.isInteger(Number(date.month)) && Number(date.month) >= 0 && Number(date.month) <= 11)) return
      searchSettings.value.monthRange = value.map(date => ({ year: Number(date.year), month: Number(date.month) }))
        .sort((a, b) => a.year - b.year || a.month - b.month)
    }

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
      calendarProps, updateMonthRange, updateSelectedMonth, updateSelectedYear,
      searchSettings,
      hideMoney,
    }
  },
}
</script>