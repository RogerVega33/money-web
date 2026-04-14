<template>
  <div class="w-full card mx-auto p-4 bg-white rounded-lg border shadow-md sm:p-8" :class="{'max-w-md': !fullScreen}">
    <div class="flex justify-between items-center mb-4">
      <h5 class="text-xl font-bold leading-none text-gray-900">{{title}}</h5>
      <fa icon="up-right-and-down-left-from-center" class="cursor-pointer" @click="requestFullScreen"/>
    </div>
    <LineChart :chartData="chartData" :options="options" v-if="labels.length && datasets.length"/>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { LineChart } from 'vue-chart-3';
import { Chart, registerables } from "chart.js";
import { ref } from 'vue';

Chart.register(...registerables);

export default defineComponent({
  name: 'Home',
  components: { LineChart },
  props: {
    labels: Array,
    datasets: Array,
    title: String,
    fullScreen: Boolean,
    hideMoney: Boolean,
  },

  setup(props) {
    const options = ref({
      responsive: true,
      aspectRatio: '1',
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false,
          text: props.title,
        },
        tooltip: {
            enabled: !props.hideMoney,
        }
      },
      scales: {
        y: {
          ticks: {
              display: !props.hideMoney,
          },
          beginAtZero: true
        }
      },
    });

    const chartData = ref({
      labels: props.labels,
      datasets: props.datasets,
    });

    return { chartData, options };
  },
  methods: {
    requestFullScreen(){
      this.$emit('requestFullScreen');
    }
  },
  watch: {
    labels: function (newData) {
      this.chartData.labels = newData;
    },
    datasets: function (newData) {
      this.chartData.datasets = newData;
    },
    fullScreen: function (newData) {
      this.options.maintainAspectRatio = !newData || undefined;
      this.options.aspectRatio = newData? '1:2':'1';
    },
    hideMoney: function (newData) {
      this.options.scales.y.ticks.display = !newData;
      this.options.plugins.tooltip.enabled = !newData;
    }
  }
});
</script>