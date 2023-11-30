<script setup lang="ts">
import { BLEDevice, type SpokyError, SensorsLogger } from './HandleSensors'
import { format } from '../abstract/formatter'

var saved_position: GeolocationPosition

navigator.geolocation.watchPosition((position) => {
    saved_position = position
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
},
{
    enableHighAccuracy: true
})

function updateLocation() {
    const timestamp = document.getElementById('timestamp')
    const lat = document.getElementById('lat')
    const lon = document.getElementById('lon')

    if (lat && lon && timestamp) {
        timestamp.innerText = format.ms_show(saved_position.timestamp)
        lat.innerText       = format.gps(saved_position.coords.latitude)
        lon.innerText       = format.gps(saved_position.coords.longitude)

    }
    SensorsLogger.log.gps = {
        accuracy:           saved_position.coords.accuracy,
        latitude:           saved_position.coords.latitude,
        longitude:          saved_position.coords.longitude,
        speed:              saved_position.coords.speed
    }
    SensorsLogger.log.timestamp = saved_position.timestamp

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
