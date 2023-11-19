<script lang="ts" setup>
import { SensorsLogger } from './components/HandleSensors'

</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { repo, DbInit } from './abstract/repository'

export default defineComponent({
    methods: {
        refresh_all_logs() {
            repo.local.open()
            .then(x => repo.local.trip.get_all()
            .then(trips => {
                //alert(trips)
                console.log(trips)
                this.alltrips = trips
                this.alltrips.forEach(trip => {
                    trip.data = []
                    repo.local.sensors.load(trip.key)
                    .then(logs => {
                        trip.data = logs
                        //alert(logs)
                        this.$forceUpdate()
                    })
                })
            }))
        },
        delete_trip(key: number): void {
            repo.local.trip.delete(key)
            .then(x => this.refresh_all_logs())
            console.log('delete', key)
        },
        create() {
            repo.local.open()
            .then(x => repo.local.trip.create('no')
            .then(x => {console.log(x); this.refresh_all_logs()}))
        }
    },
    data() {
        return {
            alltrips: [],
            render: DbInit.push(this.refresh_all_logs)
        }
    }
})
</script>

<template>
    <div><button class="btn btn-info w-100 mb-2" :onclick="SensorsLogger.flush">Flush All</button></div>
    <div><button class="btn btn-info w-100 mb-2" :onclick="create">create</button></div>
    
    <div id="logs">
        <div v-for="(trip) in alltrips">
            {{ trip.value }}
            <button @click="delete_trip(trip.key)">Delete</button>
            <p>{{ trip.data.length }}</p>
        </div>
    </div>
</template>

