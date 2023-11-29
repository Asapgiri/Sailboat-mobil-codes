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
var rotm: number[]

const degrees_to_radians = (deg:number) => (deg * Math.PI) / 180.0
const rot_to_rad = (mval: number) => mval * Math.PI * 2

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
    
    const quaterns = getQuaternion(e.alpha, e.beta, e.gamma)
    rotm = getRotationMatrix(e.alpha, e.beta, e.gamma)
    if (!orientation_initialized) {
        orientation_initialized = true
        orient_offset_y = rotm[8]
    }
    orient.x = rotm[6] * 90
    orient.y = (rotm[8] - orient_offset_y) * 180
    
    e_orientation.style.rotate = `${orient.x}deg`
    
    const vertical   = orient.y        // Math.cos(orient.x) * orient.y //* (-1)
    const horizontal = 0               // Math.sin(orient.x) * orient.y //* (-1)
    e_orientation.style.translate    = `${horizontal}px ${vertical}px`

    const e_orent = document.getElementById('orient')
    if (e_orent) {
        e_orent.innerText = `x: ${format.orient(orient.x)}deg, y: ${format.orient(orient.y)}deg ... tilt: ${format.orient(e.gamma)}`
        //e_orent.innerHTML += '<br/> ' + format.orient(e.gamma)  + ' gamma'
        //e_orent.innerHTML += '<br/> ' + format.orient(e.alpha)  + ' alpha'
        //e_orent.innerHTML += '<br/> ' + format.orient(e.beta)   + ' beta'
        //
        //e_orent.innerHTML += '<br/>' + format.orient(quaterns.w)
        //e_orent.innerHTML += '<br/>' + format.orient(quaterns.x)
        //e_orent.innerHTML += '<br/>' + format.orient(quaterns.y)
        //e_orent.innerHTML += '<br/>' + format.orient(quaterns.z)
        
        //e_orent.innerHTML += '<br/>' + format.orient(rotm[0]) + ' ' + format.orient(rotm[1]) + ' ' + format.orient(rotm[2])
        //e_orent.innerHTML += '<br/>' + format.orient(rotm[3]) + ' ' + format.orient(rotm[4]) + ' ' + format.orient(rotm[5 ])
        //e_orent.innerHTML += '<br/>' + format.orient(rotm[6]) + ' ' + format.orient(rotm[7]) + ' ' + format.orient(rotm[8])
    }
}

const degtorad = Math.PI / 180; // Degree-to-Radian conversion

function getRotationMatrix(alpha: number, beta: number, gamma: number) {
    var _x = beta  ? beta  * degtorad : 0; // beta value
    var _y = gamma ? gamma * degtorad : 0; // gamma value
    var _z = alpha ? alpha * degtorad : 0; // alpha value

    var cX = Math.cos( _x );
    var cY = Math.cos( _y );
    var cZ = Math.cos( _z );
    var sX = Math.sin( _x );
    var sY = Math.sin( _y );
    var sZ = Math.sin( _z );

    //
    // ZXY rotation matrix construction.
    var m11 = cZ * cY - sZ * sX * sY;
    var m12 = - cX * sZ;
    var m13 = cY * sZ * sX + cZ * sY;

    var m21 = cY * sZ + cZ * sX * sY;
    var m22 = cZ * cX;
    var m23 = sZ * sY - cZ * cY * sX;

    var m31 = - cX * sY;
    var m32 = sX;
    var m33 = cX * cY;

    return [
        m11,    m12,    m13,
        m21,    m22,    m23,
        m31,    m32,    m33
    ];
}

function getQuaternion(alpha: number, beta: number, gamma: number) {
    var _x = beta  ? beta  * degtorad : 0; // beta value
    var _y = gamma ? gamma * degtorad : 0; // gamma value
    var _z = alpha ? alpha * degtorad : 0; // alpha value

    var cX = Math.cos( _x/2 );
    var cY = Math.cos( _y/2 );
    var cZ = Math.cos( _z/2 );
    var sX = Math.sin( _x/2 );
    var sY = Math.sin( _y/2 );
    var sZ = Math.sin( _z/2 );

    //
    // ZXY quaternion construction.
    var w = cX * cY * cZ - sX * sY * sZ;
    var x = sX * cY * cZ - cX * sY * sZ;
    var y = cX * sY * cZ + sX * cY * sZ;
    var z = cX * cY * sZ + sX * sY * cZ;

    return {w, x, y, z};
} 

function changeWindDirection() {
    const e_wind_dir_apparent = document.getElementById('wind_dir_apparent')
    const e_wind_dir_true     = document.getElementById('wind_dir_true')
    
    if (e_wind_dir_apparent) e_wind_dir_apparent.style.rotate = `${BLEDevice.sensors.deg}deg`
}

function change() {
    changeWindDirection()
    SensorsLogger.log.phone.compass = -compass
    SensorsLogger.log.phone.orient  = rotm
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
        <h4>
            <span id="orient"></span>
        </h4>
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
