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
import type { DbFunctions } from './abstract/sensorlog_models'
import mapboxgl from "mapbox-gl"
import { logic } from './abstract/dblogic'
import { stringify } from 'querystring';


export default defineComponent({
    methods: {
        search_init() {
            this.search = {}
            if ('' != window.location.search) {
                window.location.search.split('?')[1].split('&').forEach(search => {
                    const ss = search.split('=')
                    this.search[ss[0]] = ss[1]
                })
            }

        },
        load_init() {
            if (!this.search.ext || !this.search.tid) {
                alert("Error in parameters!")
                return
            }

            if (this.is_external()) {
                this.load_external()
            }
            else {
                DbInit.push(this.load_local)
            }
        },
        load_logs(rep: DbFunctions) {
            this.search_init()
            logic.load(rep, this.search.tid)
            .then(ret => {
                this.trip = ret.trip
                this.logs = ret.logs
            })
        },
        load_external() {
            const intid = setInterval(() => {
                if (this.user) {
                    clearInterval(intid)
                    this.load_logs(repo.db)
                }
            }, 50)
        },
        load_local() {
            this.load_logs(repo.local)
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
        is_external() {
            this.search_init()
            return 'undefined' != this.search.ext && this.search.ext
        },
        delete_trip(): void {
            this.search_init()
            var key: number | sring
            if (!this.is_external()) {
                key = parseInt(this.search.tid)
            }
            else {
                key = this.search.tid
            }
            logic.delete(key)
            .then(() => window.location.href = '/')
        },
        sync_trip() {
            this.search_init()
            logic.sync(parseInt(this.search.tid))
            .then((newid) => window.location.href = `/dashview?tid=${newid}&ext=true`)
        }
    },
    data() {
        return {
            user: useCurrentUser(),
            trip: null,
            logs: null,
            map: null,
            search: {
                tid: 'undefined',
                ext: 'undefined'
            },
            render: this.search_init() & this.load_init()
        }
    }
})
</script>


<template>
    <div v-if="logs">
        <div :style="{backgroundColor: trip.color}"><h1>{{ trip.name }}</h1></div>
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
        <button class="btn w-100 mt-1 btn-success p-2 mx-0" v-if="!is_external()" :onclick="sync_trip">Sync</button>
        <button class="btn w-100 mt-1 btn-danger  p-2 mx-0"  :onclick="delete_trip">Delete</button>
    </div>
</template>
