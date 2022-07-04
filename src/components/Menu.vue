<template>
    <div id="menu" class="bg-green-800 p-2">
        <nav class="container mx-auto">
            <div class="flex flex-wrap justify-between items-center mx-auto text-white">
                <router-link to="/">
                    <fa icon="sack-dollar" class="text-green-300" /> <span class="hover:text-cyan-300">Money app</span>
                </router-link>
                <div class="w-full block w-auto text-white">
                    <ul class="flex flex-row space-x-8 cursor-pointer">
                        <li v-if="!loggedIn" class="hover:text-cyan-300">
                            <router-link to="/login">Login</router-link>
                        </li>
                        <li v-else class="hover:text-cyan-300" @click.prevent="logOut">
                            <span>Logout</span>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </div>
</template>

<script>
export default {
    name: 'Menu',
    props: {
        loggedIn: Boolean
    },
    methods: {
        logOut() {
            this.$store.dispatch('auth/logout');
            this.$router.push('/');
        }
    },
}
</script>