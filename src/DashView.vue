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
import type { DbFunctions, LogData } from './abstract/sensorlog_models'
import mapboxgl from "mapbox-gl"
import { logic } from './abstract/dblogic'
import { stringify } from 'querystring';


export default defineComponent({
    methods: {
        search_init() {
            this.search = {
                tid: '',
                ext: false
            }
            if ('' != window.location.search) {
                window.location.search.split('?')[1].split('&').forEach(search => {
                    const ss = search.split('=')
                    if ('tid' == ss[0]) {
                        this.search.tid = ss[1] 
                    }
                    else if ('ext' == ss[0]) {
                        this.search.ext = 'true' == ss[1]
                    }
                })
            }

        },
        load_init() {
            if (!this.search.tid) {
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
                this.dbloaded.db = true
                if (this.dbloaded.mapinit) {
                    this.dbloaded.mapinit()
                }
            })
            .catch(alert)
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
            repo.local.open()
            .then(() => this.load_logs(repo.local))
        },
        map_sync() {
            if (this.logs) {
                const gj = {
                    type: 'geojson',
                    data: {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            coordinates: [] as number[][],
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
        },
        onmapload(instance: any) {
            this.map = instance
            this.map.on('load', () => {
                if (this.dbloaded.db) {
                    this.map_sync()
                }
                else {
                    this.dbloaded.mapinit = this.map_sync
                }
            })
        },
        is_external() {
            this.search_init()
            return this.search.ext
        },
        delete_trip(): void {
            this.search_init()
            var key: number | string
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
                tid: '',
                ext: false
            },
            dbloaded: {
                db: false,
                mapinit: null
            },
            render: this.search_init() & this.load_init()
        } as {
            user: any,
            logs: LogData[] | null,
            trip: any | {
                external: boolean,
                logid: number | string,
                name: string,
                color: string,
                date: {
                    start: number,
                    end: number
                }
            },
            search: {
                tid: string,
                ext: boolean
            },
            dbloaded: {
                mapinit: Function | null,
                db: boolean
            },
            map: any,
            render: any
        }
    }
})
</script>


<template>
    <div>
        <div v-if="trip" :style="{backgroundColor: trip.color}"><h1>{{ trip.name }}</h1></div>
        <div v-if="trip && trip.date"><h5>From {{ format.datetime(trip.date.start) }}<br/>to {{ format.datetime(trip.date.end) }}</h5></div>

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
