<template>
  <div class="w-full card mx-auto p-4 bg-white rounded-lg border shadow-md sm:p-8" :class="{'max-w-md': !fullScreen}">
    <div class="flex justify-between items-center mb-4">
      <h5 class="text-xl font-bold leading-none text-gray-900">{{title}}</h5>
      <fa icon="up-right-and-down-left-from-center" class="cursor-pointer" @click="requestFullScreen"/>
    </div>
    <div v-if="labels.length && values.length">
      <BarChart :key="chartKey" :chartData="chartData" :options="options"/>
    </div>
    <span v-else>Sin registro</span>
  </div>
</template>

<script>
import { defineComponent, ref, watch, onMounted, nextTick } from 'vue';
import { BarChart } from 'vue-chart-3';
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default defineComponent({
  name: 'Home',
  components: { BarChart },
  props: {
    labels: Array,
    values: Array,
    title: String,
    fullScreen: Boolean,
    hideMoney: Boolean,
    color: {
      type: String,
      default: '#1D9E75'
    }
  },
  setup(props, { emit }) {

    const options = ref({
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: !props.hideMoney,
          backgroundColor: '#1f2937',
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            // muestra el valor con símbolo de moneda
            label: (ctx) => ` $${ctx.parsed.x.toLocaleString('es-EC', { minimumFractionDigits: 2 })}`
          }
        },
      },
      scales: {
        x: {
          // color de las líneas de la cuadrícula vertical, con 15% de opacidad
          grid: { color: 'rgba(107, 114, 128, 0.15)' },
          ticks: {
            color: '#6b7280',  // color gris para los números del eje
            // formatea el número: 1500 → "$1.5k", 20000 → "$20.0k"
            callback: (v) => '$' + (v / 1000).toFixed(1) + 'k'
          },
          beginAtZero: true  // el eje siempre empieza en 0, no en el valor mínimo del dataset
        },
        y: {
          grid: { display: false }, // oculta las líneas horizontales de la cuadrícula
          ticks: {
            color: '#6b7280', // color gris para las etiquetas de categorías
            autoSkip: false, // muestra todas las etiquetas aunque no quepan bien
            maxRotation: 0, // mantiene las etiquetas horizontales, sin rotarlas
          },
        }
      }
    });

    const makeDataset = (data, color) => [{
      data,  // los valores numéricos de las barras, ej: [39252, 28517, 25887]
      backgroundColor: color + 'cc', // color de las barras con ~80% opacidad ('cc' en hex = 204/255)
      hoverBackgroundColor: color, // color sólido al pasar el mouse encima (sin opacidad)
      borderRadius: 6,  // esquinas redondeadas en las barras (en píxeles)
      borderSkipped: false,  // aplica el borderRadius también en la base de la barra
    }];

    const chartData = ref({ labels: [], datasets: [] });
    const chartKey = ref(0);
    const savedAspectRatio = ref(1);

    function requestFullScreen(){
      emit('requestFullScreen');
    }

    function updateChart() {
      // si alguno de los dos arrays está vacío, no hace nada y sale
      if (!props.labels.length || !props.values.length) return;

      // une labels y values en pares: [{l: 'Salud', d: 890}, {l: 'Alimentación', d: 450}]
      // el spread [...] crea una copia para no mutar el array original
      const sorted = [...props.labels.map((l, i) => ({ l, d: props.values[i] }))]
          .sort((a, b) => b.d - a.d); // ordena de mayor a menor por el valor d

      // separa los pares ya ordenados de vuelta en labels y values
      chartData.value.labels = sorted.map(s => s.l);   // ['Salud', 'Alimentación']
      chartData.value.datasets = makeDataset(sorted.map(s => s.d), props.color); // [890, 450]

      // calcula la altura proporcional a la cantidad de barras:
      // - 400 / (n * 35) da un ratio menor mientras más barras haya (más alto)
      // - Math.min(3) evita que con pocas barras el gráfico quede demasiado alto
      savedAspectRatio.value = Math.min(3, 400 / (props.labels.length * 35));

      // aplica el ratio calculado a las opciones del gráfico
      options.value.aspectRatio = savedAspectRatio.value;

      // incrementa la key para forzar que Vue destruya y recree el componente
      // con las nuevas opciones — sin esto Chart.js puede ignorar los cambios
      chartKey.value++;
    }

    onMounted(() => {
      updateChart();
    });

    watch(() => props.labels, async () => {
      await nextTick();
      updateChart();
    });

    watch(() => props.values, async () => {
      await nextTick();
      updateChart();
    });

    watch(() => props.fullScreen, (newVal) => {
      options.value.maintainAspectRatio = !newVal || undefined;
      // en fullscreen usa '1:2' (más alto que ancho) para aprovechar la pantalla
      // al salir restaura el ratio que se calculó en updateChart() según la cantidad de barras
      options.value.aspectRatio = newVal ? '1:2' : savedAspectRatio.value;

      // fuerza a Vue a destruir y recrear el componente para que
      // Chart.js aplique las nuevas opciones de aspecto correctamente
      chartKey.value++;
    });

    watch(() => props.hideMoney, (newVal) => {
      options.value.scales.x.ticks.display = !newVal;
      options.value.plugins.tooltip.enabled = !newVal;
    });

    return {
      chartData,
      options,
      makeDataset,
      chartKey,
      savedAspectRatio,
      requestFullScreen
    };
  }
});
</script>