<template>
  <div class="w-full card mx-auto p-4 bg-white rounded-lg border shadow-md sm:p-8" :class="{'max-w-md': !fullScreen}">
    <div class="flex justify-between items-center mb-4">
      <h5 class="text-xl font-bold leading-none text-gray-900">{{title}}</h5>
      <fa icon="up-right-and-down-left-from-center" class="cursor-pointer" @click="requestFullScreen"/>
    </div>
    <DoughnutChart :chartData="chartData" :options="options" v-if="labels.length && data.length"/>
    <span v-else>Sin registro</span>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { DoughnutChart } from 'vue-chart-3';
import { Chart, registerables } from "chart.js";
import { ref } from 'vue';

Chart.register(...registerables);

export default defineComponent({
  name: 'Home',
  components: { DoughnutChart },
  props: {
    labels: Array,
    data: Array,
    title: String,
    fullScreen: Boolean,
    hideMoney: Boolean,
  },
  setup(props) {
    const colors = [
      '#3366cc', '#dc3912', '#ff9900', '#109618', '#990099', '#0099c6',
      '#dd4477', '#66aa00', '#b82e2e', '#316395', '#994499', '#22aa99',
      '#aaaa11', '#6633cc', '#e67300', '#8b0707', '#651067', '#329262',
      '#5574a6', '#3b3eac', '#b77322', '#16d620', '#b91383', '#f4359e',
      '#9c5935', '#a9c413', '#2a778d', '#668d1c', '#bea413', '#0c5922',
      '#743411'];

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
    });

    const chartData = ref({
      labels: props.labels,
      datasets: [
        {
          data: props.data,
          backgroundColor: colors,
        },
      ],
    });

    return { chartData, colors, options };
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
    data: function (newData) {
      this.chartData.datasets = [
        {
          data: newData,
          backgroundColor: this.colors,
        },
      ];
    },
    fullScreen: function (newData) {
      this.options.maintainAspectRatio = !newData || undefined;
      this.options.aspectRatio = newData? '1:2':'1';
    },
    hideMoney: function (newData) {
      this.options.plugins.tooltip.enabled = !newData;
    }
  }
});
</script>