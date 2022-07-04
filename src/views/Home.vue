<template>
  <div class="home flex justify-center">
    <div class="grid md:grid-cols-3">
      <div class="text-center self-center md:col-span-2">
        <p class="text-5xl md:text-7xl text-white">Money app</p>
        <p class="text-3xl md:text-5xl text-white p-10">Lleva registro de tus gastos</p>
        <p class="text-xl md:text-3xl text-white">Toma decisiones basadas en datos</p>
      </div>
      <div class="md:self-center">
        <img src="../assets/money.gif" alt="money" class="money" />
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    computed: {
      loggedIn() {
        return this.$store.state.auth.status.loggedIn;
      },
    },
    created() {
      if (this.loggedIn) {
        this.$router.push("/dashboard");
      }
    },
  }
</script>

<style>
  .money {
    max-width: 200px;
    margin-left: auto;
    margin-right: auto;
  }
</style>