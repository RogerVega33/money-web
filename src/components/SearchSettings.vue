<template>
  <div class="search-settings">
    <div class="w-full mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">Configuración</h5>
      </div>
      <div class="flow-root">
        <template v-if="selectedWallet.type !== 'crypto'">
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
            <Datepicker v-model="searchSettings.dateSelected" monthPicker autoApply v-if="searchSettings.dateRangePicked === 'month'"/>
            <Datepicker v-model="searchSettings.dateSelected.year" yearPicker autoApply v-if="searchSettings.dateRangePicked === 'year'"/>
          </div>
          <div class="mt-4">
            <label for="checked-toggle" class="relative inline-flex items-center mb-4 cursor-pointer">
              <input type="checkbox" value="" id="checked-toggle" class="sr-only peer" v-model="searchSettings.showTransactionsByCategory">
              <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Mostrar transacciones por categoría</span>
            </label>
          </div>
        </template>
        <div class="mt-2">
          <label for="checked-toggle-2" class="relative inline-flex items-center mb-4 cursor-pointer">
            <input type="checkbox" value="" id="checked-toggle-2" class="sr-only peer" v-model="hideMoney">
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Ocultar dinero</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import store from '../store'

export default {
  name: 'SearchSettings',
  props: {
    selectedWallet: Object,
  },
  setup() {
    const searchSettings = ref({
      dateSelected: {
        month: new Date().getMonth(),
        year: new Date().getFullYear()
      },
      dateRangePicked: "month",
      showTransactionsByCategory: true
    });
    const hideMoney = ref(store.state.app.hideMoney)
    return {
      searchSettings,
      hideMoney
    }
  },
  methods: {
    changeSearchSettings(){
      this.$emit('change-search-settings', this.searchSettings);
    }
  },
  watch: {
    searchSettings: {
      handler() {
        this.changeSearchSettings();
      },
      deep: true
    },
    hideMoney: function (newData) {
        this.$store.commit('app/SET_HIDE_MONEY', newData)
    },
  },
}
</script>