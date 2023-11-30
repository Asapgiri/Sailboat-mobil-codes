<script lang="ts" setup>
import { SensorsLogger } from './components/HandleSensors'
import { config } from './config';
import { format } from './abstract/formatter'
import Login from './Login.vue'
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { useCurrentUser } from "vuefire";
import { repo, DbInit } from './abstract/repository'
import { logic } from './abstract/dblogic'
import type { Progress } from '@/abstract/dblogic'

export default defineComponent({
    methods: {
        load_external_first() {
            const intid = setInterval(() => {
                //collapse: boolean = true('interval..')
                if (this.user) {
                    clearInterval(intid)
                    this.load_external_logs()
                }
            }, 50)
        },
        sort_alltrips() {
            this.alltrips.sort((a, b) => {
                if (a.data.start > b.data.start){
                    return -1
                }
                if (a.data.start < b.data.start){
                    return 1
                }
                return 0
            })
        },
        load_local_logs() {
            repo.local.open()
            .then(repo.local.trip.getall)
            .then(trips => {
                this.alltrips = trips
                this.local_trip_count = trips.length
                this.alltrips.forEach(trip => {
                    trip.data = []
                    repo.local.sensors.load(trip.logid)
                    .then(logs => {
                        trip.data = {
                            start: logs[0].timestamp,
                            end: logs[logs.length - 1].timestamp
                        }
                        //alert(logs)
                        this.sort_alltrips()
                        this.$forceUpdate()
                    })
                })
            })
        },
        load_external_logs() {
            if (this.user) {
                repo.db.trip.getall()
                .then(tripssnapshot => {
                    tripssnapshot.forEach(trip => {
                        const tripdata = trip.data()
                        this.alltrips.push({
                            external: true,
                            logid: trip.id,
                            name: tripdata.name,
                            color: tripdata.color,
                            data: tripdata.date
                        })
                    })
                    this.sort_alltrips()
                    this.$forceUpdate()
                })
            }
        },
        refresh_all_logs() {
            this.load_local_logs()
            this.load_external_logs()
        },
        create() {
            logic.dummy.create()
            .then(x => {console.log(x); this.refresh_all_logs()})
        },
        open_trip(trip: string, external: boolean) {
            window.location.href = `/dashview?tid=${trip}&ext=${external}`
        },
        sync_trip(key: number) {
            logic.sync(key)
            .then(this.refresh_all_logs)
        },
        sync_all() {
            if (!navigator.onLine) {
                alert('Cannot upload: No Ethernet')
                return
            }
            this.sync.running = true
            this.sync.progress = 0
            logic.syncall(progress => {
                this.sync.progress = Math.ceil((progress.current / progress.all) * 100)
                this.$forceUpdate()
            })
            .then(() => {
                this.refresh_all_logs()
                this.sync.running = false
            })
            .catch(alert)
        }
    },
    data() {
        return {
            sync: {
                running: false,
                progress: 0
            },
            alltrips: [],
            local_trip_count: 0,
            user: useCurrentUser(),
            render: DbInit.push(this.refresh_all_logs) && this.load_external_first()
        }
    }
})
</script>

<template>
    <div v-if="user && local_trip_count">
        <div v-if="sync.running" class="mb-1" style="background-color: green; height: 10px;" :style="{width: `${sync.progress}%`}"></div>
        <button class="btn btn-info w-100 mb-2" :onclick="sync_all">Sync All</button>
    </div>
    <!--
    -->
    <div><button class="btn btn-info w-100 mb-2" :onclick="create">create</button></div>
    
    <div v-if="!user">
        <Login/>
    </div>

    <div id="logs">
        <div v-for="(trip) in alltrips" class="border my-2" :style="{backgroundColor: trip.color}">
            <div class="m-2 p-1" @click="open_trip(trip.logid, trip.external)" style="cursor: pointer;">
                <h2>{{ trip.name }}</h2>
            </div>
            <div v-if="trip.data.start"><h5>From {{ format.datetime(trip.data.start) }}<br/>to {{ format.datetime(trip.data.end) }}</h5></div>
            <div v-else>{{ trip.data }}</div>
            <button class="btn w-100 mt-1 btn-success p-2 mx-0" v-if="!trip.external" @click="sync_trip(trip.logid)">Sync</button>
            <!--
                <button class="btn w-100 mt-1 btn-danger  p-2 mx-0"  @click="trip.external ? delete_trip_db(trip.key) : delete_trip_local(trip.key)">Delete</button>
            -->
        </div>
    </div>
</template>

