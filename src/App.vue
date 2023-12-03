<script setup lang="ts">
import Meter from './Meter.vue'
import Dashboard from './Dashboard.vue'
import Login from './Login.vue'
import Logout from './Logout.vue'
import DashView from './DashView.vue'
import NotFound404 from './NotFound404.vue'
import { useCurrentUser } from 'vuefire'

const user = useCurrentUser()

async function loggedin() {
    const currentUser = await useCurrentUser()
    if (currentUser) console.log('logged in')
    else      console.log('logged out')
}
loggedin()

// routing
const routes = [
    { name: 'Dashboard', app: Dashboard, route: ['/dashboard','/'], onbar: true },
    { name: 'DashView',  app: DashView,  route: ['/dashview'],      onbar: false }
    { name: 'Meter',     app: Meter,     route: ['/meter'],         onbar: true },
    { name: 'Login',     app: Login,     route: ['/login'],         onbar: true },
    { name: 'Logout',    app: Logout,    route: ['/logout'],        onbar: true },
]

var CurrentPage: any = NotFound404

routes.forEach(route =>  {
    if (route.route.includes(window.location.pathname)) {
        CurrentPage = route.app
    }
})

</script>

<script lang="ts">


// create an async function to request a wake lock
if ("wakeLock" in navigator) {
  var wakeLock = navigator.wakeLock.request("screen");
  console.log('Wakelog is active..')
}


import { defineComponent } from 'vue'

export default defineComponent({
    methods: {
        change_collapse() {
            this.collapse = !this.collapse
            this.$forceUpdate()
        }
    },
    data() {
        return {
            collapse: true
        }
    }
})

</script>

<template>
    <div class="container-fluid m-0 p-0">
        <nav class="navbar navbar-expand-sm navbar-dark bg-dark">
            <a class="navbar-brand mx-2" href="/">Sailboat Multimeter</a>
            <button class="navbar-toggler mx-2" type="button"  :onclick="change_collapse">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="navbar-collapse" :class="collapse ? 'collapse' : ''" id="navbarsExample03">
                <ul class="navbar-nav mr-auto">
                    <li v-for="route in routes" class="nav-item">
                        <a v-if="route.onbar && ((route.app != Logout && route.app != Login) || ((route.app == Logout && user) || (route.app == Login && !user)))" class="nav-link" :class="route.app == CurrentPage ? 'active' : ''" v-bind:href="route.route[0]">
                            {{ route.name }}
                        </a>
                    </li>
                </ul>
            </div>

            <a v-if="user" class="navbar-brand mx-2" href="/user">{{ user.providerData[0].displayName }}</a>
        </nav>

        <main class="d-flex justify-content-center">
            <div class="container py-2 h-100">
                <div class="row d-flex align-items-center justify-content-center h-100">
                        <CurrentPage/>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
</style>
