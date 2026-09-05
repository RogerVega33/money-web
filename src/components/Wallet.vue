<template>
  <div class="wallet">
    <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
      <div class="flex justify-between items-center mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">Billeteras</h5>
        <div>
          <fa icon="plus" v-if="!showForm"
              class="cursor-pointer text-green-600" @click="addWallet"/>
          <fa icon="gear" v-if="selectedWallet.id && !showForm" @click="editWallet"
              class="cursor-pointer text-gray-600 pl-2"
          />
          <fa icon="xmark" v-if="showForm" @click="hideForms"
              class="cursor-pointer text-red-600"
          />
        </div>
      </div>
      <div class="flow-root" :aria-busy="loading">
        <p v-if="loading" role="status" class="text-gray-600">Cargando billeteras<LoadingDots /></p>
        <div v-else-if="loadError" role="alert"><p class="text-red-500">No se pudieron cargar las billeteras.</p><button type="button" class="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500" @click="$emit('retry')">Reintentar</button></div>
        <ul role="list" class="divide-y divide-gray-200" v-else-if="wallets.length > 0">
          <li class="py-3 sm:py-4" v-for="wallet in wallets" :key="wallet.id">
            <div @click="selectWallet(wallet)"
                 :class="{ 'text-blue-700': selectedWallet.id === wallet.id }"
                 class="flex items-center space-x-4 text-gray-900 hover:text-blue-500 cursor-pointer">
              <div class="flex-shrink-0">
                <fa icon="sack-dollar" class="text-green-500 h-8" v-if="wallet.type === 'fiat'"/>
                <fa :icon="['fab', 'bitcoin']" class="text-yellow-300 h-8" v-if="wallet.type === 'crypto'"/>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm truncate" :class="selectedWallet.id === wallet.id? 'font-bold':'font-medium'">
                  {{wallet.name}}
                </p>
              </div>
              <div class="inline-flex items-center text-base font-semibold">
                {{formatCurrency(wallet.total)}}
              </div>
            </div>
          </li>
          <li class="py-3 sm:py-4">
            <div  class="flex items-center space-x-4 text-gray-900 hover:text-blue-500">
              <div class="flex-1 min-w-0">
                <p class="text-sm truncate font-bold">
                  TOTAL
                </p>
              </div>
              <div class="inline-flex items-center text-base font-semibold">
                {{ formatCurrency(getTotalWallets) }}
              </div>
            </div>
          </li>
        </ul>
        <p v-else class="text-gray-600">Todavía no tienes billeteras. Usa el botón + para agregar una.</p>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingDots from '@/components/common/LoadingDots.vue'
import { ref, computed } from 'vue'
import { formatCurrency } from '../utils/formats'

export default {
  name: 'Wallet',
  components: { LoadingDots },
  props: {
    wallets: Array,
    loading: Boolean,
    loadError: Object,
    showFormNewWallet: Boolean,
    showFormEditWallet: Boolean,
  },
  setup(props, { emit }) {

    const selectedWallet = ref({})

    const selectWallet = (wallet) => {
      selectedWallet.value = wallet
      emit('select-wallet', wallet)
    }

    const addWallet = () => {
      emit('add-wallet')
    }

    const editWallet = () => {
      emit('edit-wallet')
    }

    const hideForms = () => {
      emit('hide-forms')
    }

    const showForm = computed(() => {
      return props.showFormNewWallet || props.showFormEditWallet
    })

    const getTotalWallets = computed(() => {
      return props.wallets.reduce((acum, item) => {
        return acum + Number(item.total)
      }, 0)
    })

    return {
      selectedWallet,
      selectWallet,
      addWallet,
      editWallet,
      hideForms,
      showForm,
      getTotalWallets,
      formatCurrency
    }
  },
}
</script>