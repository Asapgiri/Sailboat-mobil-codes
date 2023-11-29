<script lang="ts" setup>
import { config } from './config'
import { MapboxMap, MapboxMarker } from '@studiometa/vue-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { format } from './abstract/formatter'
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { useCurrentUser } from "vuefire"
import { repo, DbInit } from './abstract/repository'
import mapboxgl from "mapbox-gl"


export default defineComponent({
    methods: {
        search_init() {
            this.search = {}
            //console.log(window.location.search)
            if ('' != window.location.search) {
                window.location.search.split('?')[1].split('&').forEach(search => {
                    const ss = search.split('=')
                    this.search[ss[0]] = ss[1]
                })
            }

            //console.log(this.search)
        },
        load_init() {
            if (!this.search.ext || !this.search.tid) {
                alert("Error in parameters!")
                return
            }

            console.log(this.search.ext, this.search.tid)
            if ("undefined" != this.search.ext && this.search.ext) {
                this.load_external()
            }
            else {
                DbInit.push(this.load_local)
            }
        },
        load_external() {
            console.log('load external', this.search)
            const intid = setInterval(() => {
                //console.log('interval..')
                if (this.user) {
                    clearInterval(intid)
                    this.search_init()
                    //console.log(this.search)
                    repo.db.trip.load(this.search.tid)
                    .then(trip => {
                        this.trip = trip
                        repo.db.sensors.load(trip.logid)
                        .then(logs => {
                            this.logs = logs
                        })
                        .catch(alert)
                    })
                }
            }, 50)
        },
        load_local() {
            this.search_init()
            console.log('load local', this.search)
            repo.local.open()
            .then(() => repo.local.trip.get(parseInt(this.search.tid)))
            .then(trip => {
                console.log(trip)
                this.trip = trip
                repo.local.sensors.load(trip.key)
                .then(logs => {
                    this.logs = logs
                })
            })
        },
        onmapload(instance: any) {
            this.map = instance
            this.map.on('load', () => {
                if (this.logs) {
                    const gj = {
                        type: 'geojson',
                        data: {
                            type: "Feature",
                            properties: {},
                            geometry: {
                                coordinates: [],
                                type: "LineString"
                            }
                        }
                    }

                    if (this.logs.length) {
                        this.logs.forEach(spot => {
                            gj.data.geometry.coordinates.push([
                                spot.gps.longitude,
                                spot.gps.latitude,
                            ])
                        })

                        console.log(gj)
                        this.map.addSource('trip', gj)

                        // Create a 'LngLatBounds' with both corners at the first coordinate.
                        const bounds = new mapboxgl.LngLatBounds(
                            gj.data.geometry.coordinates[0],
                            gj.data.geometry.coordinates[0]
                        );
                        
                        // Extend the 'LngLatBounds' to include every coordinate in the bounds result.
                        for (const coord of gj.data.geometry.coordinates) {
                            bounds.extend(coord);
                        }
                        
                        this.map.fitBounds(bounds, {
                            padding: 20
                        });

                        this.map.addLayer({
                            'id': 'trip',
                            'type': 'line',
                            'source': 'trip',
                            'layout': {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            'paint': {
                                'line-color': config.mapbox.line.color,
                                'line-width': config.mapbox.line.width
                            }
                        })
                    }
                }
            })
        },
        delete_trip_local(key: number): void {
            repo.local.trip.delete(key)
            .then(() => window.location.href = '/dashboard')
        },
        delete_trip_db(key: string): void {
            repo.db.trip.delete(key)
            .then(() => window.location.href = '/dashboard')
        },
    },
    data() {
        return {
            user: useCurrentUser(),
            trip: null,
            logs: null,
            map: null,
            search: {},
            render: this.search_init() & this.load_init()
        }
    }
})
</script>


<template>
    <div v-if="logs">
        <div><h1>{{ trip.name }}</h1></div>
        <div v-if="trip.date"><h5>From {{ format.datetime(trip.date.start) }}<br/>to {{ format.datetime(trip.date.end) }}</h5></div>

        <MapboxMap :access-token="config.mapbox.token"
                   :mapStyle="config.mapbox.style"
                   :style="{height: config.mapbox.height}"
                   :center="config.mapbox.center"
                   @mb-created="onmapload">
        </MapboxMap>
        <!--
        <div v-for="spot in logs">{{ spot }}</div>
        -->
        <button class="btn w-100 mt-1 btn-danger  p-2 mx-0"  @click="search.ext ? delete_trip_db(search.tid) : delete_trip_local(search.tid)">Delete</button>
    </div>
</template>
