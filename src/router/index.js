import {createRouter, createWebHistory} from "vue-router"

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import NewUser from '../views/NewUser.vue'
import RecoverUser from '../views/RecoverUser.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
    {path: '/', name: 'Home', component: Home},
    {path: '/login', name: 'Login', component: Login},
    {path: '/newUser', name: 'NewUser', component: NewUser},
    {path: '/recoverUser', name: 'RecoverUser', component: RecoverUser},
    {path: '/dashboard', name: 'Dashboard', component: Dashboard}
]


const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const publicPages = ['/', '/login', '/newUser', '/recoverUser']
    const authRequired = !publicPages.includes(to.path)
    const loggedIn = localStorage.getItem('user')
    if (authRequired && !loggedIn) {
        next('/login')
    } else {
        next()
    }
});

export default router