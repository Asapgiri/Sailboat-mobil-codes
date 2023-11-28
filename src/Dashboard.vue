<script lang="ts" setup>
import { SensorsLogger } from './components/HandleSensors'
import { config } from './config';
import { format } from './abstract/formatter'
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { useCurrentUser } from "vuefire";
import { repo, DbInit } from './abstract/repository'
import { threadId } from 'worker_threads';

export default defineComponent({
    methods: {
        load_external_first() {
            const intid = setInterval(() => {
                //console.log('interval..')
                if (this.user) {
                    clearInterval(intid)
                    this.load_external_logs()
                }
            }, 50)
        },
        load_local_logs() {
            repo.local.open()
            .then(repo.local.trip.get_all)
            .then(trips => {
                this.alltrips = trips
                this.local_trip_count = trips.length
                this.alltrips.forEach(trip => {
                    trip.data = []
                    repo.local.sensors.load(trip.key)
                    .then(logs => {
                        trip.data = logs.length
                        //alert(logs)
                        this.$forceUpdate()
                    })
                })
            })
        },
        load_external_logs() {
            if (this.user) {
                repo.local.open()
                .then(repo.db.trip.loadall)
                .then(tripssnapshot => {
                    tripssnapshot.forEach(trip => {
                        const tripdata = trip.data()
                        this.alltrips.push({
                            external: true,
                            key: trip.id,
                            value: tripdata.name,
                            data: tripdata.date
                        })
                    })
                    this.$forceUpdate()
                })
            }
        },
        refresh_all_logs() {
            this.load_local_logs()
            this.load_external_logs()
        },
        create() {
            repo.local.open()
            .then(() => repo.local.trip.create(Math.random() * 100))
            .then(keys => {
                const new_key = keys[keys.length - 1]
                for (let i = 0; i < 5; i++) {
                    repo.local.sensors.store({
                        tripindex: new_key,
                        ble: {
                            strue: {
                                s0: false,
                                s1: false,
                                s2: false
                            },
                            rpm: 0,
                            ws: 0,
                            adc: 0,
                            deg: 0,
                            mpu: {
                                temp: 0,
                                orient: {
                                    roll: 0,
                                    pitch: 0,
                                    yaw: 0
                                },
                                acc: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            }
                        },
                        phone: {
                            compass: 0,
                            orient: { x: 0, y: 0 }
                        }, gps: {
                            accuracy: 0,
                            altitude: 0,
                            altitudeAccuracy: 0,
                            heading: 0,
                            latitude: Math.random() * 100 - 50,
                            longitude: Math.random() * 100 - 50,
                            speed: 0
                        },
                        timestamp: i + 50000000
                    })
                }
            })
            .then(x => {console.log(x); this.refresh_all_logs()})
        },
        open_trip(trip: string, external: boolean) {
            window.location.href = `/dashview?tid=${trip}&ext=${external}`
        },
        sync_trip(key: number) {
            repo.local.trip.get(key)
            .then(trip => {
                repo.local.sensors.load(key)
                .then(logs => {
                    //alert(trip)
                    repo.db.trip.store(trip, logs)
                    .then(() => {
                        repo.local.trip.delete(key)
                        repo.local.sensors.clean(key)
                        this.refresh_all_logs()
                    })
                })
            })
        }
    },
    data() {
        return {
            alltrips: [],
            local_trip_count: 0,
            user: useCurrentUser(),
            render: DbInit.push(this.refresh_all_logs) && this.load_external_first()
        }
    }
})
</script>

<template>
    <div v-if="local_trip_count"><button class="btn btn-info w-100 mb-2" :onclick="SensorsLogger.flush">Sync All</button></div>
    <!--
    -->
    <div><button class="btn btn-info w-100 mb-2" :onclick="create">create</button></div>
    
    <div v-if="!user"><button class="btn btn-warning w-100 p-3 my-5" onclick="window.location.href='/login'">Login</button></div>

    <div id="logs">
        <div v-for="(trip) in alltrips" class="border my-2">
            <div class="m-2 p-1" @click="open_trip(trip.key, trip.external)" style="cursor: pointer;">
                <h2>{{ trip.value }}</h2>
            </div>
            <div v-if="trip.data.start"><h5>From {{ format.datetime(trip.data.start) }}<br/>to {{ format.datetime(trip.data.end) }}</h5></div>
            <div v-else>{{ trip.data }}</div>
            <button class="btn w-100 mt-1 btn-success p-2 mx-0" v-if="!trip.external" @click="sync_trip(trip.key)">Sync</button>
            <!--
            <button class="btn w-100 mt-1 btn-danger  p-2 mx-0"  @click="trip.external ? delete_trip_db(trip.key) : delete_trip_local(trip.key)">Delete</button>
            -->
        </div>
    </div>
</template>

