<template>
  <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">
    <div class="flex justify-between items-center mb-4">
      <h5 class="text-xl font-bold leading-none text-gray-900">{{title}}</h5>
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
    title: String
  },

  setup(props) {
    const options = ref({
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false,
          text: props.title,
        },
      },
    });

    const chartData = ref({
      labels: props.labels,
      datasets: props.datasets,
    });

    return { chartData, options };
  },
  watch: {
    labels: function (newData) {
      this.chartData.labels = newData;
    },
    datasets: function (newData) {
      this.chartData.datasets = newData;
    },
  }
});
</script>