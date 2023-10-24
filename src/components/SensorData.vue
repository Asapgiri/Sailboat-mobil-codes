<script setup lang="ts">
import { BLEDevice, BLEConnect } from './HandleSensors'
import { SensorsLogger } from './HandleSensors'
import { format } from '../abstract/formatter'
import { config } from '../config'

</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    methods: {
        connect() {
            BLEDevice.update.push(this.$forceUpdate)
            BLEConnect(() => {
                // should be reconnect etc.. so reset is not always the best option
                SensorsLogger.reset()
            })
        }
    }
})
</script>

<template>
    <div class="col-6">
        Stored log count: {{ SensorsLogger.logs.length }}
    </div>
    <div class="col-6">
        Ellapsed: <span v-bind:class="SensorsLogger.is_running ? SensorsLogger.is_pauused ? 'text-danger' : 'text-success' : ''">{{ SensorsLogger.time.ellapsed }}</span>
    </div>
        
    <div v-if="!BLEDevice.connected">
        <button class="btn btn-primary py-3 w-100 mb-2" :onclick="connect">Connect</button>
    </div>
    <div v-else>
        <div class="display-4">
            {{ BLEDevice.name }} ({{ format.ms_show(BLEDevice.ms) }}ms)
        </div>

        <button v-if="!SensorsLogger.is_running" class="btn btn-success py-3 w-100 mb-2" :onclick="SensorsLogger.start">
            Start
        </button>
        <button v-if="SensorsLogger.is_running && !SensorsLogger.is_pauused" class="btn btn-secondary py-3 w-50 mb-2" :onclick="SensorsLogger.pause">
            Pause
        </button>
        <button v-if="SensorsLogger.is_running && SensorsLogger.is_pauused" class="btn btn-success py-3 w-50 mb-2" :onclick="SensorsLogger.continue">
            Continue
        </button>
        <button v-if="SensorsLogger.is_running" class="btn btn-warning py-3 w-50 mb-2" :onclick="SensorsLogger.stop">
            Stop
        </button>

<!--    <div>
            <p>Ellapsed: <span id="ellapsed"></span>ms</p>
        </div>
        <div>
            <p>Min: <span id="minms"></span>ms - Max: <span id="maxms"></span>ms - Now: <span id="ms"></span>{{ BLEDevice.ms }}ms</p>
        </div>
        <div>
            <p>
                Command: 
                <input type="tex" id="command">
                <button onclick="sendCommand()">Send</button>
                <input type="radio" name="hexselect" id="hex" value="HEX">HEX
                <input type="radio" name="hexselect" id="string" value="STRING">STRING
            </p>
        </div>    -->
        

        <div v-if="config.extendedView" class="row">
            <div class="col-3">
                <b>Sensors:</b>
            </div>
            <div class="col-9 display-4">
                <span id="strue">
                    [
                        {{ BLEDevice.sensors.strue.s0 ? '__' : '---' }}
                        {{ BLEDevice.sensors.strue.s1 ? '__' : '---' }}
                        {{ BLEDevice.sensors.strue.s2 ? '__' : '---' }}
                    ]
                </span>
            </div>
        </div>

        <div class="row">
            <div class="col-2">
                <b>Speed:</b><br/>
                [km/h]
            </div>
            <div class="col-3 display-4">
                <span id="rpm">{{ format.speed(BLEDevice.sensors.ws) }}</span>
            </div>
            <div class="col-2 text-center">
                <b>Dir:</b>
            </div>
            <div class="col-3 display-4">
                <span id="deg">{{ format.speed(BLEDevice.sensors.deg) }}</span>&#176;
            </div>
        </div>
        <div v-if="config.extendedView" class="row">
            <div class="col-2">
                [rpm]
            </div>
            <div class="col-4 display-4">
                <span id="ws">{{ format.speed(BLEDevice.sensors.rpm) }}</span>
            </div>
            <div class="col-2">
                <b>Adc:</b>
            </div>
            <div class="col-3 display-4">
                <span id="adc">{{ format.speed(BLEDevice.sensors.adc) }}</span>
            </div>
        </div>

        <!--<div>
            <table>
                <tr><th align="left" colspan="2">Wane</th></tr>
                <tr><td>Adc:</td><td><span id="adc">{{ BLEDevice.sensors.adc }}</span></td></tr>
                <tr><td>Deg:</td><td><span id="deg">{{ BLEDevice.sensors.deg }}</span>&#176;</td></tr>
                <tr></tr>
                <tr><th align="left" colspan="2">MPU</th></tr>
                <tr><td>Orientation:  </td><td><span id="mpu_orient"></span></td></tr>
                <tr><td>Acceleration: </td><td><span id="mpu_acc"></span></td></tr>
                <tr><td>Temp:</td><td><span id="mpu_temp">0</span>&#176;C</td></tr>
                <tr><td>ResultantG:</td><td><span id="resultantG">0</span></td></tr>
            </table>

            <table>
                <tr><th align="left" colspan="4">Speedmap</th></tr>
                <tr><td>0:</td><td><input type="text" id="sm-limit-0" value="0" disabled></td><td><input type="text" id="sm-coeff-0"></td><td><button onclick="rm_sm_row(0)">X</button></td></tr>
                <tr id="new_row"><td colspan="4"><button onclick="add_sm_row()">+</button></td></tr>
                <tr><td colspan="4"><button id="write" onclick="sm_row_write()">Write</button></td></tr>
            </table>
        </div>    -->
  </div>
</template>

<style scoped>
table {
    width: 48%;
}
</style>
