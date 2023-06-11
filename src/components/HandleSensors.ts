//import 'web-bluetooth'

/////////////////////////////////////////////////////////////////////////////////////////////////
/// Typedefs
/////////////////////////////////////////////////////////////////////////////////////////////////

export type SpokyError = {
    modul: string,
    msg: string
}

type WSBLESensorsType = {
    strue: {
        s0: boolean
        s1: boolean
        s2: boolean
    } 
    rpm: number
    ws: number
    adc: number
    deg: number
    mpu: {
        temp: number
        orient: {
            roll: number
            pitch: number
            yaw: number
        }
        acc: {
            x: number
            y: number
            z: number
        }
    }
}

type LogData = {
    ble: WSBLESensorsType,
    phone: {
        compass: number,
        orient: {
            x: number,
            y: number
        }
    },
    gps: GeolocationPosition
}

type BLELogger = {
    logs: string,
    log: LogData,
    save: Function,
    flush: Function
}

type WSBLEDeviceType = {
    connected: boolean
    name: string
    deviceId: string
    ms: number
    gatt: BluetoothRemoteGATTServer | undefined
    chardev: BluetoothRemoteGATTCharacteristic | undefined
    sensors: WSBLESensorsType,
    update: Function[],
    errors: SpokyError[]
}


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Consts
/////////////////////////////////////////////////////////////////////////////////////////////////

const CMD_HEADER_SIZE = 2

const CMD_PING = 0
const CMD_SET_FILTER_WINDOW = 1
const CMD_SET_WANE_TO_OFFSET = 2
const CMD_SET_WANE_TO_CORRENT = 3
const CMD_MPU_CALIBRATE = 4
const CMD_SET_SPEEDMAP = 5


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Variables
/////////////////////////////////////////////////////////////////////////////////////////////////

var can_update: boolean

var dec = new TextDecoder("utf-8");
var enc = new TextEncoder();

var startTime: Date
var endTime: Date
var nextTime: Date = new Date()
var minms = 1000
var maxms = 0
var ellapsed: number

var msgchart = false
var sm_row_count = 1

var initTime = new Date()


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Publics
/////////////////////////////////////////////////////////////////////////////////////////////////

export var BLEDevice: WSBLEDeviceType = {
    connected: false,
    name: '',
    deviceId: '',
    ms: 0,
    gatt: undefined,
    chardev: undefined,
    sensors: {
        strue: {
            s0: false,
            s1: false,
            s2: false
        },
        rpm: 0,
        ws: 0,
        adc: 0,
        deg: 0,
        mpu: {
            temp: 0,
            orient: {
                roll: 0,
                pitch: 0,
                yaw: 0
            },
            acc: {
                x: 0,
                y: 0,
                z: 0
            }
        }
    },
    update: [],
    errors: []
}

export var SensorsLogger: BLELogger = {
    logs: '',
    log: { ble: { strue: { s0: false, s1: false, s2: false }, rpm: 0, ws: 0, adc: 0, deg: 0, mpu: { temp: 0, orient: { roll: 0, pitch: 0, yaw: 0 }, acc: { x: 0, y: 0, z: 0 } } }, phone: { compass: 0, orient: { x: 0, y: 0 } }, gps: { coords: { accuracy: 0, altitude: 0, altitudeAccuracy: 0, heading: 0, latitude: 0, longitude: 0, speed: 0 }, timestamp: 0 } },
    save: () => {
        SensorsLogger.logs += SensorsLogger.log.ble.strue.s0 + ','
        SensorsLogger.logs += SensorsLogger.log.ble.strue.s1 + ','
        SensorsLogger.logs += SensorsLogger.log.ble.strue.s2 + ','
        SensorsLogger.logs += SensorsLogger.log.ble.rpm + ','
        SensorsLogger.logs += SensorsLogger.log.ble.ws + ','
        SensorsLogger.logs += SensorsLogger.log.ble.adc + ','
        SensorsLogger.logs += SensorsLogger.log.ble.deg + ','
        
        SensorsLogger.logs += SensorsLogger.log.phone.compass + ','
        SensorsLogger.logs += SensorsLogger.log.phone.orient.x + ','
        SensorsLogger.logs += SensorsLogger.log.phone.orient.y + ','

        SensorsLogger.logs += SensorsLogger.log.gps.coords.accuracy + ','
        SensorsLogger.logs += SensorsLogger.log.gps.coords.altitude ? SensorsLogger.log.gps.coords.altitude : '' + ','
        SensorsLogger.logs += SensorsLogger.log.gps.coords.altitudeAccuracy ? SensorsLogger.log.gps.coords.altitudeAccuracy : '' + ','
        SensorsLogger.logs += SensorsLogger.log.gps.coords.heading ? SensorsLogger.log.gps.coords.heading : '' + ','
        SensorsLogger.logs += SensorsLogger.log.gps.coords.latitude + ','
        SensorsLogger.logs += SensorsLogger.log.gps.coords.longitude + ','
        SensorsLogger.logs += SensorsLogger.log.gps.coords.speed ? SensorsLogger.log.gps.coords.speed : '' + ','

        SensorsLogger.logs += SensorsLogger.log.gps.timestamp + '\n'
        SensorsLogger.log = { ble: { strue: { s0: false, s1: false, s2: false }, rpm: 0, ws: 0, adc: 0, deg: 0, mpu: { temp: 0, orient: { roll: 0, pitch: 0, yaw: 0 }, acc: { x: 0, y: 0, z: 0 } } }, phone: { compass: 0, orient: { x: 0, y: 0 } }, gps: { coords: { accuracy: 0, altitude: 0, altitudeAccuracy: 0, heading: 0, latitude: 0, longitude: 0, speed: 0 }, timestamp: 0 } }
    },
    flush: () => {
        
        // TODO: Sand back logs to server...

        console.log(SensorsLogger.logs)
        SensorsLogger.logs = ''
    }
}

var list10: number[] = []

function start() {
    startTime = new Date()
};

function end() {
    endTime = new Date()
    list10.push(endTime - startTime)
    if (list10.length > 10) {
        list10.shift()
    }
    var sum = 0
    list10.forEach(x => sum += x)
    BLEDevice.ms = sum / 10
}

export function BLEConnect() {
    navigator.bluetooth.requestDevice({
        filters: [{
            name: 'WS_TEST_ESP'
            //services: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
        }],
        //acceptAllDevices: true,
        optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
    })
    .then(device => {
        BLEDevice.name = device.name ? device.name : ''
        BLEDevice.deviceId = device.id
        BLEDevice.gatt = device.gatt

        console.log(BLEDevice)

        return device.gatt?.connect()
    })
    .then(server => {
        return server?.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
    })
    .then(service => {
        return service?.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
    })
    .then(characteristic => {
        BLEDevice.connected = true
        BLEDevice.chardev = characteristic
        characteristic?.addEventListener('characteristicvaluechanged',
        messageChanged);
        console.log(BLEDevice)
        setInterval(update, 10);
        start()
        update_start()
    })
    .catch(error => { console.error(error) })
}

/*function messageChangedFromJSON(event) {
    decodedJSON = dec.decode(event.target.value.buffer)
    document.getElementById('output').innerText = decodedJSON

    parsedJSON = JSON.parse(decodedJSON)

    rpm.innerText = parsedJSON.speed.rpm
    ws.innerText = parsedJSON.speed.wind_speed
    adc.innerText = parsedJSON.wane.adc
    deg.innerText = parsedJSON.wane.deg
    mpu_orient.innerText = parsedJSON.mpu.mpu_orient
    mpu_temp.innerText = parsedJSON.mpu.temp
    resultantG.innerText = parsedJSON.mpu.resultantG

    acc_html = ''
    parsedJSON.mpu.acc.forEach(element => {
        acc_html += `${element}<br/>`
    })

    mpu_acc.innerHTML = acc_html

    msgchart = false
    //update()

    end()
    start()
}*/

function messageChanged(event: Event) {
    var value = (event.target as BluetoothRemoteGATTCharacteristic).value
    if (value == undefined) {
        return
    }
    var dataview = new DataView(value.buffer)

    
    const upvals = dataview.getUint32(0, true)

    BLEDevice.sensors.strue.s0 = (upvals & 4) > 0
    BLEDevice.sensors.strue.s1 = (upvals & 2) > 0
    BLEDevice.sensors.strue.s2 = (upvals & 1) > 0
    BLEDevice.sensors.rpm      = dataview.getFloat32(4, true)
    BLEDevice.sensors.ws       = dataview.getFloat32(8, true)
    BLEDevice.sensors.adc      = dataview.getUint32(12, true)
    BLEDevice.sensors.deg      = dataview.getFloat32(16, true)
    BLEDevice.sensors.mpu.temp = dataview.getFloat32(20, true)
    BLEDevice.sensors.mpu.orient.roll  = dataview.getFloat32(24, true)
    BLEDevice.sensors.mpu.orient.pitch = dataview.getFloat32(28, true)
    BLEDevice.sensors.mpu.orient.yaw   = dataview.getFloat32(32, true)

    BLEDevice.sensors.mpu.acc.x = dataview.getFloat32(36, true)
    BLEDevice.sensors.mpu.acc.y = dataview.getFloat32(40, true)

    msgchart = false
    BLEDevice.errors = []
    BLEDevice.update.forEach(fun => fun())

    SensorsLogger.log.ble = BLEDevice.sensors
    SensorsLogger.save()

    if  (new Date() > nextTime) {
        SensorsLogger.flush()
        nextTime = new Date()
        nextTime.setSeconds(nextTime.getSeconds() + 1)
    }


    //console.log(BLEDevice)

    end()
    start()
}

function update() {
    if (msgchart) {
        return
    }
    msgchart = true

    if (can_update) BLEDevice.chardev?.readValue()
}

function update_start() {
    can_update = true
    update()
}

function update_stop() {
    can_update = false
}

export function sendCommand(msg: string | ArrayBuffer, prev: null | boolean = null) {
    var prev_update: null | boolean
    
    if (null != prev) {
        prev_update = prev
    }
    else {
        prev_update = can_update
    }
    can_update = false

    setTimeout(() => {
        BLEDevice.chardev?.writeValue(typeof msg === 'string' ? enc.encode(msg as string) : msg as ArrayBuffer)
            .then(() => {
                if (prev_update) {
                    update_start()
                }
            })
            .catch(err => {
                console.log(err)
                sendCommand(msg, prev_update)
            })
    }, 25)
}

/*function add_sm_row() {
    original = document.getElementById('new_row').outerHTML
    document.getElementById('new_row').outerHTML = `<tr><td>${sm_row_count}:</td><td><input type="text" id="sm-limit-${sm_row_count}"></td><td><input type="text" id="sm-coeff-${sm_row_count}"></td><td><button onclick="rm_sm_row(${sm_row_count})">X</button></td></tr>` + original
    sm_row_count++
}

function sm_row_write() {
    send_array = []

    var arr = new ArrayBuffer(CMD_HEADER_SIZE + 2 + sm_row_count * 2 * 4)
    var dtv = new DataView(arr)
    dtv.setUint8(0, CMD_SET_SPEEDMAP, true)
    dtv.setUint8(1, 35, true)

    offset = CMD_HEADER_SIZE;
    dtv.setUint16(offset, sm_row_count, true)
    offset += 2
    for (let i = 0; i < sm_row_count; i++) {
        lim = parseFloat(document.getElementById(`sm-limit-${i}`).value)
        coeff = parseFloat(document.getElementById(`sm-coeff-${i}`).value)

        dtv.setFloat32(offset, lim, true)
        offset += 4
        dtv.setFloat32(offset, coeff, true)
        offset += 4

        send_array.push([lim, coeff])
    }

    console.log(arr)
    sendCommand(arr)
}*/
