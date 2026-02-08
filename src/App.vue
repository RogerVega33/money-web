<template>
  <div>
    <Menu :loggedIn="loggedIn"/>
    <div>
      <router-view/>
    </div>
  </div>
  <!--fa :icon="['fab', 'youtube']" /-->
</template>

<script>
import './assets/tailwind.css'
import Menu from './components/Menu.vue'

export default {

name: 'App',
components: {
  Menu
},
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
mounted() {
    this.$store.commit('app/SET_HIDE_MONEY', localStorage.getItem("hideMoney") === "true")
}
}
</script>