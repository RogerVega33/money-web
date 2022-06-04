<template>
    <div id="menu" class="bg-green-100 p-7">
        <nav class="container mx-auto">
            <div class="flex flex-wrap justify-between items-center mx-auto">
                <router-link to="/">
                    <fa icon="sack-dollar" class="text-green-500" /> <span class="hover:text-blue-600">Money app</span>
                </router-link>
                <div class="w-full block w-auto">
                    <ul class="flex flex-row space-x-8">
                        <li v-if="!loggedIn" class="hover:text-blue-600">
                            <router-link to="/login">Login</router-link>
                        </li>
                        <li v-else class="hover:text-blue-600" @click.prevent="logOut">
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
            this.$router.push('/login');
        }
    },
}
</script>