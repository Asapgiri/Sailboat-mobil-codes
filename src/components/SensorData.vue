<script setup lang="ts">
import { BLEDevice, BLEConnect } from './HandleSensors'
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    methods: {
        connect() {
            BLEDevice.update.push(this.$forceUpdate)
            BLEConnect()
        }
    }
})
</script>

<template>
    <div>
        Connected to: <span>{{ BLEDevice.connected ? BLEDevice.name : 'not connectrd' }}</span>
        <button v-if="!BLEDevice.connected" @click="connect" ref="connectButton">Connect</button>
        <span v-if="BLEDevice.connected" > ({{ BLEDevice.ms }}ms)</span>
    </div>
    <div v-if="BLEDevice.connected">
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
        
        <div>
            <table>
                <tr>
                    <th align="left" colspan="2">Speed</th>
                    <th align="left" colspan="2">Wane</th>
                </tr>
                <tr>
                    <td>Sensors:</td><td><span id="strue">{ {{ BLEDevice.sensors.strue.s0 ? '_' : '-' }} {{ BLEDevice.sensors.strue.s1 ? '_' : '-' }} {{ BLEDevice.sensors.strue.s2 ? '_' : '-' }} }</span></td>
                    <td></td><td></td>
                </tr>
                <tr>
                    <td>Speed:</td><td><span id="rpm">{{ BLEDevice.sensors.rpm.toFixed(2) }}</span> [rpm]</td>
                    <td>Adc:</td><td><span id="adc">{{ BLEDevice.sensors.adc.toFixed(0) }}</span></td>
                </tr>
                <tr>
                    <td>ws:</td><td><span id="ws">{{ BLEDevice.sensors.ws.toFixed(2) }}</span> [km/h]</td>
                    <td>Deg:</td><td><span id="deg">{{ BLEDevice.sensors.deg.toFixed(2) }}</span>&#176;</td>
                </tr>
        <!--    <tr><th align="left" colspan="2">Wane</th></tr>
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
                <tr><td colspan="4"><button id="write" onclick="sm_row_write()">Write</button></td></tr>    -->
            </table>
        </div>
  </div>
</template>

<style scoped>
table {
    width: 48%;
}
</style>
