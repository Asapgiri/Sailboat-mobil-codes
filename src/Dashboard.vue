<script lang="ts" setup>
import {  SensorsLogger } from './components/HandleSensors'
import { repo } from './abstract/repository'

var savedlogs: any
repo.local.sensors.load_trips()
.then(res => { savedlogs = res })

function create() {
    //repo.local.trip.create('no')
    //    .then((res) => console.log(res))

    console.log(savedlogs)
}
</script>

<template>
    <div><button class="btn btn-info w-100 mb-2" :onclick="SensorsLogger.flush">Flush All</button></div>
    <div><button class="btn btn-info w-100 mb-2" :onclick="create">create</button></div>
    

    <div v-for="log in savedlogs" class="row p-2 border">
        <div class="col-12 display-4">
            Taken {{ log.length }} logs at
        </div>
        <div class="col-12">
            {{ new Date(log[0].timestamp) }}
        </div>
        <div class="col-12">
            <button class="btn btn-warning w-100 mb-2">Upload</button>
        </div>
    </div>
</template>

