import {createRouter, createWebHistory} from "vue-router"

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import NewUser from '../views/NewUser.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
    {path: '/', name: 'Home', component: Home},
    {path: '/login', name: 'Login', component: Login},
    {path: '/newUser', name: 'NewUser', component: NewUser},
    {path: '/dashboard', name: 'Dashboard', component: Dashboard}
]


const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const publicPages = ['/', '/login', '/newUser']
    const authRequired = !publicPages.includes(to.path)
    const loggedIn = localStorage.getItem('user')
    if (authRequired && !loggedIn) {
        next('/login')
    } else {
        next()
    }
});

export default router