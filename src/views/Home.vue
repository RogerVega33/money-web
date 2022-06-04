<template>
  <div class="home flex justify-center">
    <div>Home</div>
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
