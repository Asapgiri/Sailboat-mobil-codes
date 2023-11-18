<script lang="ts" setup>
import { SensorsLogger } from './components/HandleSensors'


</script>
<script lang="ts">
import { repo, DbInit } from './abstract/repository'

function refresh_all_logs() {
    repo.local.open()
    .then(x => repo.local.trip.get_all()
    .then(trips => {
        //alert(trips)
        console.log(trips)
        const logs_div = document.getElementById('logs')
        if (logs_div && trips) {
            logs_div.innerHTML = 'Trips:'
            let i = 0
            trips.forEach(element => {
                logs_div.innerHTML += '<p>' + element + '<button onclick="delete_trip('+ (i++) +')">Delete</button>' + '</p>'
            });
        }
    }))
}

DbInit.push(refresh_all_logs)


function create() {
    repo.local.open()
    .then(x => repo.local.trip.create('no')
    .then(x => refresh_all_logs()))
}

function delete_trip(key: number): void {
    repo.local.trip.delete(key)
    .then(x => refresh_all_logs())
}
</script>

<template>
    <div><button class="btn btn-info w-100 mb-2" :onclick="SensorsLogger.flush">Flush All</button></div>
    <div><button class="btn btn-info w-100 mb-2" :onclick="create">create</button></div>
    
    <div id="logs">

    </div>
    <!--
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
    -->
</template>

