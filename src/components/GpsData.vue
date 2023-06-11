<script setup lang="ts">
import { BLEDevice, type SpokyError, SensorsLogger } from './HandleSensors'

function updateLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
        const timestamp = document.getElementById('timestamp')
        const lat = document.getElementById('lat')
        const lon = document.getElementById('lon')

        if (lat && lon && timestamp) {
            timestamp.innerText = position.timestamp.toFixed(0)
            lat.innerText       = position.coords.latitude.toFixed(6)
            lon.innerText       = position.coords.longitude.toFixed(6)
        }
        SensorsLogger.log.gps = position
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
    <div>
        Timestamp:  <span id="timestamp"></span><br>
        Lat:        <span id="lat"></span><br>
        Lon:        <span id="lon"></span>
    </div>
</template>

<style scoped>

</style>
