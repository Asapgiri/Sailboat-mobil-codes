<script setup lang="ts">
import Meter from './Meter.vue'
import Dashboard from './Dashboard.vue'
import Login from './Login.vue'

// routing
const routes = [
    { name: 'Dashboard', app: Dashboard, route: '/dashboard' },
    { name: 'Meter',     app: Meter,     route: '/meter' },
    { name: 'Login',     app: Login,     route: '/login' },
]

var CurrentPage = Dashboard

routes.forEach(route =>  {
    if (route.route == window.location.pathname) {
        CurrentPage = route.app
    }
})



</script>

<script lang="ts">
// create an async function to request a wake lock
if ("wakeLock" in navigator) {
  var wakeLock = await navigator.wakeLock.request("screen");
  console.log('Wakelog is active..')
}


</script>

<template>
    <nav class="navbar navbar-expand navbar-dark bg-dark">
        <a class="navbar-brand" href="/">Sailboat Multimeter</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExample03" aria-controls="navbarsExample03" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarsExample03">
            <ul class="navbar-nav mr-auto">
                <li v-for="route in routes" v-class="route.app == CurrentPage ? 'nav-item active' : 'nav-item' ">
                    <a class="nav-link" v-bind:href="route.route">
                        {{ route.name }}
                    </a>
                </li>
            </ul>
        </div>
    </nav>

    <main class="d-flex justify-content-center">
        <CurrentPage/>
    </main>
</template>

<style scoped>
</style>
