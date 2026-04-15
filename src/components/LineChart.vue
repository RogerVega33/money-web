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
import { defineComponent, ref, watch } from 'vue';
import { LineChart } from 'vue-chart-3';
import { Chart, registerables } from "chart.js";
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(...registerables, annotationPlugin);

export default defineComponent({
  name: 'Home',
  components: { LineChart },
  props: {
    labels: Array,
    datasets: Array,
    title: String,
    fullScreen: Boolean,
    hideMoney: Boolean,
    showAverage: Boolean,
  },

  setup(props, { emit }) {
    const avgColor = '#3366cc';
    const avgLabel = 'Promedio';

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
          callbacks: {
            title: (tooltipItems) => {
              // si el hover es sobre el dataset fantasma, no muestra título
              const isPromedio = tooltipItems.some(item => item.dataset.label === avgLabel);
              return isPromedio ? '' : tooltipItems[0].label;
            },
            label: (tooltipItem) => {
              if (tooltipItem.dataset.label === avgLabel) {
                return `Promedio: $${tooltipItem.raw}`;
              }
              return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
            },
            labelColor: (tooltipItem) => {
              if (tooltipItem.dataset.label === avgLabel) {
                return {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderColor: avgColor,
                };
              }
              // devuelve los valores originales del dataset
              return {
                backgroundColor: tooltipItem.element.options.backgroundColor,
                borderColor: tooltipItem.element.options.borderColor,
                borderWidth: tooltipItem.element.options.borderWidth,
              };
            }
          }
        },
        annotation: {
          annotations: {
            // se llenará dinámicamente desde el watcher
          }
        }
      },
      scales: {
        x: {
          ticks: {
            callback: function(value) {
              const label = this.getLabelForValue(value);
              return label.substring(0, 7); // Toma solo "YYYY-MM"
            },
            autoSkip: true, // opcional: salta etiquetas si hay muchas
          }
        },
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

    function requestFullScreen(){
      emit('requestFullScreen');
    }

    watch(() => props.labels, (newData) => {
      chartData.value.labels = newData;
    });

    watch(() => props.datasets, (newData) => {
      if (props.showAverage && newData[0]?.data.length > 0) {
        // calcula el promedio
        let avgDataset = newData[0]?.data.reduce((acum, num) => acum + num, 0) / newData[0]?.data.length;
        avgDataset = avgDataset.toFixed(2)

        chartData.value.datasets = [
          ...newData,
          {
            label: avgLabel,
            data: new Array(newData[0].data.length).fill(avgDataset), // línea invisible
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            pointRadius: 0, // puntos invisibles
            pointHoverRadius: 0, // círculo al hacer hover
            pointHitRadius: 10, // área de detección
          }
        ];

        options.value = {
          ...options.value,
          plugins: {
            ...options.value.plugins,
            legend: {
              position: 'top',
              labels: {
                filter: (legendItem) => {
                  // oculta de la leyenda cualquier dataset llamado con avgLabel
                  return legendItem.text !== avgLabel;
                }
              }
            },
            annotation: {
              annotations: {
                promedio: {
                  type: 'line',
                  yMin: avgDataset,
                  yMax: avgDataset,
                  borderColor: avgColor,
                  borderWidth: 2,
                  borderDash: [6, 4], // línea punteada
                }
              }
            }
          }
        }
      } else {
        chartData.value.datasets = newData;
        options.value.plugins.annotation.annotations = {};
      }
    }, { immediate: true });

    watch(() => props.fullScreen, (newData) => {
      options.value.maintainAspectRatio = !newData || undefined;
      options.value.aspectRatio = newData ? '1:2' : '1';
    });

    watch(() => props.hideMoney, (newData) => {
      options.value.scales.y.ticks.display = !newData;
      options.value.plugins.tooltip.enabled = !newData;
    });

    return { avgColor, avgLabel, chartData, options, requestFullScreen };
  }
});
</script>