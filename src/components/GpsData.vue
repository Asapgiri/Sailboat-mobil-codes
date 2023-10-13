<script setup lang="ts">
import { BLEDevice, type SpokyError, SensorsLogger } from './HandleSensors'
import { format } from '../abstract/formatter'

function updateLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
        const timestamp = document.getElementById('timestamp')
        const lat = document.getElementById('lat')
        const lon = document.getElementById('lon')

        if (lat && lon && timestamp) {
            timestamp.innerText = format.ms_show(position.timestamp)
            lat.innerText       = format.gps(position.coords.latitude)
            lon.innerText       = format.gps(position.coords.longitude)
        }
        SensorsLogger.log.gps = {
            accuracy:           position.coords.accuracy,
            latitude:           position.coords.latitude,
            longitude:          position.coords.longitude,
            speed:              position.coords.speed
        }
        SensorsLogger.log.timestamp = position.timestamp

    },
    (err) => {
        var newError: SpokyError = {
            modul: 'GPS',
            msg: ''
        }

        switch(err.code) {
            case err.PERMISSION_DENIED:
                newError.msg = "User denied the request for Geolocation."
                break
            case err.POSITION_UNAVAILABLE:
                newError.msg = "Location information is unavailable."
                break
            case err.TIMEOUT:
                newError.msg = "The request to get user location timed out."
                break
            default:
                newError.msg = "An unknown error occurred."
                break
        }

        BLEDevice.errors.push(newError)
    })
}

BLEDevice.update.push(updateLocation)
</script>

<template>
    <div class="row">
        <div class="col-6">
            <b>Lat:</b>
        </div>
        <div class="col-6">
            <b>Lon:</b>
        </div>
    </div>
    <div class="row text-center">
        <div class="col-6 display-4">
            <span id="lat"></span>
        </div>
        <div class="col-6 display-4">
            <span id="lon"></span>
        </div>
    </div>

    <div>
        Timestamp:  <span id="timestamp"></span>
    </div>
</template>

<style scoped>

</style>
