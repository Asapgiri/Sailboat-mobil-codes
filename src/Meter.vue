<script setup lang="ts">
import GpsData from './components/GpsData.vue';
import SensorData from './components/SensorData.vue'
import WindClock  from './components/WindClock.vue'
</script>

<script lang="ts">
// create an async function to request a wake lock
</script>

<template>
    <SensorData/>
    <WindClock/>
    <GpsData/>
</template>

<style scoped>
</style>
