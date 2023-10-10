<script setup lang="ts">
import { BLEDevice, SensorsLogger } from './HandleSensors'
import { format } from '../abstract/formatter'

var orientation_initialized = false
var orient_offset_y = 0
const isIOS = navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&navigator.userAgent.match(/AppleWebKit/)
setTimeout(() => {
    if (isIOS) {
        DeviceOrientationEvent.requestPermission()
          .then((response) => {
            if (response === "granted") {
              window.addEventListener("deviceorientation", changeCompass, true);
            } else {
              alert("has to be allowed!");
            }
          })
          .catch(() => alert("not supported"));
    }
    else {
        window.addEventListener("deviceorientationabsolute", changeCompass, true);
    }

    window.addEventListener("deviceorientation", changeOrientation, true);
}, 100)

var compass = 45
var orient = {
    x: 0,
    y: 0
}

const degrees_to_radians = (deg:number) => (deg * Math.PI) / 180.0;

function changeCompass(e: any) {
    compass = e.webkitCompassHeading || Math.abs(e.alpha - 360)
    const e_compass = document.getElementById('compass')
    if (e_compass) e_compass.style.rotate  = `${-compass}deg`
}

function reset_orientation() {
    orientation_initialized = false
}

function changeOrientation(e: any) {
    const e_orientation = document.getElementById('orientation')
    if (!e_orientation) return
    
    if (!orientation_initialized) {
        orientation_initialized = true
        orient_offset_y = -e.beta
    }
    orient.x = -e.gamma
    orient.y = (e.beta + orient_offset_y) * 3
    
    e_orientation.style.rotate = `${orient.x}deg`
    const vertical   = Math.cos(-degrees_to_radians(orient.x)) * orient.y //* (-1)
    const horizontal = Math.sin(-degrees_to_radians(orient.x)) * orient.y //* (-1)
    e_orientation.style.translate    = `${horizontal}px ${vertical}px`
    const e_orent = document.getElementById('orient')
    if (e_orent) {
        e_orent.innerText = `x: ${format.orient(orient.x)}deg, y: ${format.orient(orient.y)}deg ... tilt: ${format.orient(e.gamma)}`
    }
}

function changeWindDirection() {
    const e_wind_dir_apparent = document.getElementById('wind_dir_apparent')
    const e_wind_dir_true     = document.getElementById('wind_dir_true')
    
    if (e_wind_dir_apparent) e_wind_dir_apparent.style.rotate = `${BLEDevice.sensors.deg}deg`
}

function change() {
    changeWindDirection()
    SensorsLogger.log.phone.compass = -compass
    SensorsLogger.log.phone.orient  = orient
}

BLEDevice.update.push(change)
</script>

<template>
    <div id="clock-container">
        <div id="wind_dir_apparent">
            <span class="triangle-down bg-light"></span>
        </div>
        <div id="wind_dir_true">
            <span class="triangle-down bg-white"></span>
        </div>
        <div id="circle">
            <div id="compass">
                <span id="north">N</span>
                <span id="west" >W</span>
                <span id="east" >E</span>
                <span id="south">S</span>
            </div>
            <div class="line" id="orientation"></div>
        </div>
        <div id="hider"></div>
    </div>

    
    <!--
    <div class="row">
        <div class="col-3">
            <b>Orient:</b>
        </div>
        <div class="col-3">
            x: {{ format.orient(orient.x) }}
        </div>
        <div class="col-3">
            y: {{ format.orient(orient.y) }}
        </div>
    </div> -->
    <div>
        <!-- Orient: x: {{ format.orient(orient.x) }}, y: {{ format.orient(orient.y) }}<br> -->
        <span id="orient"></span>
    </div>

    <div><button class="btn btn-danger py-3 w-100 mb-2" :onclick="reset_orientation">Reset Orientation</button></div>
</template>

<style scoped>
input {
    width: 100%;
}

#clock-container {
    float: center;
    position: relative;
    margin: 0px;
    padding: 0px;
    background: transparent;
    border: 1px solid grey;
    width: 376px;
    height: 376px;
}

#circle {
    float: center;
    position: relative;
    margin: 29px;
    padding: 29px;
    width: 320px;
    height: 320px;
    border-radius: 100%;
    background: transparent;
    border: 1px solid grey;
}

#hider {
    top: calc(159px - 1000px + 29px);
    left: calc(159px - 1000px + 29px);
    width: 2000px;
    height: 2000px;
    position: absolute;
    border-radius: 100%;
    border: calc(1000px - 129px) solid var(--vt-c-white);
    z-index: -1;
}

#compass {
    position: absolute;
    width: 260px;
    height: 260px;
    border-radius: 100%;
    background: transparent;
    border: 1px solid grey;
    transform-origin: center;
    transform:  rotate(45deg);
}
.line {
    position: absolute;
    background: skyblue;
    height: 260px;
    width: 100%;
    top: 160px;
    transform-origin: top center;
    z-index: -2;
}

#north {
    position: absolute;
    top: 15px;
    left: 15px;
    transform-origin: top center;
    transform: rotate(-45deg);
    display: inline-block;
}
#west {
    position: absolute;
    bottom: 0px;
    left: 0px;
    transform-origin: top right;
    transform:  rotate(-135deg);
    display: inline-block;
}
#east {
    position: absolute;
    top: 15px;
    right: 15px;
    transform-origin: top center;
    transform:  rotate(45deg);
    display: inline-block;
}
#south {
    position: absolute;
    bottom: 5px;
    right: 5px;
    transform-origin: top left;
    transform:  rotate(135deg);
    display: inline-block;
}

#wind_dir_apparent, #wind_dir_true {
    position: absolute;
    width: 100%;
    height: 100%;
    transform-origin: center;
}
.triangle-down {
    margin: 0 auto;
    top: 3px;
    left: 50%;
	width: 0;
	height: 0;
	border-left: 5px solid transparent;
	border-right: 5px solid transparent;
	border-top: 22px solid #555;
    position: absolute;
}
</style>
