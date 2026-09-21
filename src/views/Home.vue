<template>
  <main class="home text-white">
    <section
      v-for="(feature, index) in features"
      :id="feature.id"
      :key="feature.id"
      class="feature"
      :aria-labelledby="`${feature.id}-title`"
    >
      <div class="feature-content" :class="{ 'feature-reversed': index % 2 !== 0 }">
        <div class="feature-copy">
          <p v-if="feature.label" class="mb-5 text-sm tracking-widest uppercase text-green-100">{{ feature.label }}</p>
          <component :is="index === 0 ? 'h1' : 'h2'" :id="`${feature.id}-title`" class="feature-title">
            {{ feature.title }}
          </component>
          <p class="feature-description">{{ feature.description }}</p>
          <router-link v-if="index === 0 || index === features.length - 1" to="/login" class="signin-link">
            Iniciar sesión <span aria-hidden="true">→</span>
          </router-link>
        </div>
        <img :src="feature.image" alt="" class="money" :loading="index === 0 ? 'eager' : 'lazy'" />
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import moneyGif from '../assets/money.gif'
import walletsGif from '../assets/wallets.gif'
import chartGif from '../assets/chart.gif'
import serverGif from '../assets/server.gif'
import incognitoGif from '../assets/incognito.gif'
import criptoGif from '../assets/bitcoin.gif'

const features = [
  {
    id: 'section1',
    label: 'Money App',
    title: 'Lleva registro de tus gastos',
    description: 'Toma decisiones basadas en datos',
    image: moneyGif
  },
  {
    id: 'section2',
    title: 'Cada cosa en su lugar',
    description: 'Crea billeteras y organiza tus movimientos por categorías',
    image: walletsGif
  },
  {
    id: 'section3',
    title: 'Compatible con criptomonedas',
    description: 'También puedes registrar tus activos cripto',
    image: criptoGif
  },
  {
    id: 'section4',
    title: 'Visualiza tus números',
    description: 'Mira gráficas, descubre tendencias y encuentra en qué categorías se concentra tus dinero',
    image: chartGif
  },
  {
    id: 'section5',
    title: 'No dependas de terceros',
    description: 'Puedes ejecutar Money App en tu propio servidor',
    image: serverGif
  },
  {
    id: 'section6',
    title: 'Empieza rápido',
    description: 'Solo necesitas un usuario y contraseña para empezar',
    image: incognitoGif
  },
]

const store = useStore()
const router = useRouter()

const loggedIn = computed(() => store.state.auth.status.loggedIn)

onMounted(() => {
  if (loggedIn.value) router.push('/dashboard')
})
</script>

<style scoped>
.home {
  padding-block: clamp(4rem, 15vh, 10rem);
  padding-block: clamp(4rem, 15svh, 10rem);
}

.feature {
  position: relative;
  display: flex;
  align-items: center;
  padding: 3rem 1.5rem;
}

.feature-content {
  display: grid;
  gap: 2rem;
  align-items: center;
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
  text-align: center;
}

.feature-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1.1;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.feature-description {
  max-width: 34rem;
  margin: 1.5rem auto 0;
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  line-height: 1.6;
}

.money {
  width: 250px;
  max-width: 100%;
  height: auto;
  margin: auto;
}

.signin-link{
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  background: white;
  color: #166534;
  font-weight: 600;
}

.signin-link:hover {
  background: #dcfce7;
}

.next-feature {
  position: absolute;
  bottom: 1.75rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
  font-size: 0.875rem;
}

a:focus-visible {
  outline: 2px solid white;
  outline-offset: 5px;
}

@media (max-width: 767px) {
  .home {
    padding-block: 1rem;
    padding-top: 3rem;
    padding-bottom: 5rem;
  }

  .feature:first-child {
    padding-top: 2.5rem;
    padding-bottom: 3rem;
  }

  .feature-content {
    gap: 1rem;
  }

  .feature-content .money {
    grid-row: 1;
    width: clamp(100px, 18vh, 170px);
    width: clamp(100px, 18svh, 170px);
  }

  .feature-title {
    font-size: clamp(2rem, 7vw, 2.5rem);
  }

  .feature-description {
    margin-top: 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
  }

  .feature-copy > p:first-child:not(.feature-description) {
    margin-bottom: 0.5rem;
  }

  .signin-link {
    margin-top: 1rem;
  }
}

@media (min-width: 768px) {
  .feature {
    min-height: clamp(28rem, 65vh, 42rem);
    min-height: clamp(28rem, 65svh, 42rem);
    padding-block: 4rem;
  }

  .feature-content {
    grid-template-columns: 2fr 1fr;
    gap: 4rem;
    text-align: left;
  }

  .feature-description {
    margin-left: 0;
  }

  .feature-reversed {
    grid-template-columns: 1fr 2fr;
  }

  .feature-reversed .money {
    grid-column: 1;
    grid-row: 1;
  }

  .feature-reversed .feature-copy {
    grid-column: 2;
  }
}
@media (min-width: 768px) and (max-width: 1279px) {
  .feature {
    padding-inline: clamp(3rem, 8vw, 6rem);
  }
}
</style>
