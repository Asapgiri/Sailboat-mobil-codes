<script setup lang="ts">
import GpsData from './components/GpsData.vue';
import SensorData from './components/SensorData.vue'
import WindClock  from './components/WindClock.vue'
</script>

<script lang="ts">
// create an async function to request a wake lock
if ("wakeLock" in navigator) {
  var wakeLock = await navigator.wakeLock.request("screen");
  console.log('Wakelog is active..')
}
</script>

<template>
  
  <main>
    <SensorData/>
    <WindClock/>
    <GpsData/>
  </main>
</template>

<style scoped>
</style>
