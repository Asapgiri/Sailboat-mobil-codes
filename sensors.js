const CMD_HEADER_SIZE = 2

const CMD_PING = 0
const CMD_SET_FILTER_WINDOW = 1
const CMD_SET_WANE_TO_OFFSET = 2
const CMD_SET_WANE_TO_CORRENT = 3
const CMD_MPU_CALIBRATE = 4
const CMD_SET_SPEEDMAP = 5

var chardev
var can_update

var dec = new TextDecoder("utf-8");
var enc = new TextEncoder();
var strue = document.getElementById('strue')
var rpm = document.getElementById('rpm')
var ws = document.getElementById('ws')
var adc = document.getElementById('adc')
var deg = document.getElementById('deg')
var mpu_acc = document.getElementById('mpu_acc')
var mpu_orient = document.getElementById('mpu_orient')
var mpu_temp = document.getElementById('mpu_temp')
var resultantG = document.getElementById('resultantG')

var startTime, endTime, minms = 1000, maxms = 0;
var ms = document.getElementById('ms')
var ms_min = document.getElementById('minms')
var ms_max = document.getElementById('maxms')
var ellapsed = document.getElementById('ellapsed')

msgchart = false
sm_row_count = 1

var initTime = new Date()

function start() {
    startTime = new Date()
};

function end() {
    endTime = new Date()
    ellapsed.innerText = endTime - initTime
    var timeDiff = endTime - startTime //in ms
    ms.innerText = timeDiff
    if (timeDiff > maxms) {
        maxms = timeDiff
        ms_max.innerText = timeDiff
    }
    else if (timeDiff < minms) {
        minms = timeDiff
        ms_min.innerText = timeDiff
    }
}

function connect() {
    navigator.bluetooth.requestDevice({
        filters: [{
            name: 'WS_TEST_ESP'
            //services: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
        }],
        //acceptAllDevices: true,
        optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
    })
        .then(device => {
            document.getElementById('device').innerHTML = `${device.name}<br/>${device.id}<br/>${device.gatt}<br/>`
            console.log(device.gatt)
            //device.gatt.getPrimaryService().then(service => console.log(service))
            //device.gatt.getCharacteristic().then(char => console.log(char))
            return device.gatt.connect()
        })
        .then(server => {
            return server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
        })
        .then(service => {
            return service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
        })
        .then(characteristic => {
            chardev = characteristic
            characteristic.addEventListener('characteristicvaluechanged',
                messageChanged);
            setInterval(update, 10);
            start()
            update_start()
        })
        .catch(error => { console.error(error) })
}

function messageChangedFromJSON(event) {
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
}

function messageChanged(event) {
    dataview = new DataView(event.target.value.buffer)

    //console.log(dataview)
    document.getElementById('output').innerText = event.target.value.buffer.byteLength + '#' + dataview


    upvals = dataview.getUint32(0, true)

    strue.innerText = (upvals & 4 ? '1' : '0') + (upvals & 2 ? '1' : '0') + (upvals & 1 ? '1' : '0')
    rpm.innerText = dataview.getFloat32(4, true)
    ws.innerText = dataview.getFloat32(8, true)
    adc.innerText = dataview.getUint32(12, true)
    deg.innerText = dataview.getFloat32(16, true)
    mpu_temp.innerText = dataview.getFloat32(20, true)
    mpu_orient.innerHTML = dataview.getFloat32(24, true) + 'roll<br/>' + dataview.getFloat32(28, true) + 'pitch<br/>' + dataview.getFloat32(32, true) + 'yaw'

    //acc_html = dataview.getFloat32(32, true) + '<br/>'
    acc_html = dataview.getFloat32(36, true) + '<br/>'
    acc_html += dataview.getFloat32(40, true) + '<br/>'
    //acc_html += dataview.getFloat32(44, true) + '<br/>'
    //acc_html += dataview.getFloat32(48, true) + '<br/>'
    //acc_html += dataview.getFloat32(52, true) + '<br/>'

    //resultantG.innerText = dataview.getFloat32(60, true)


    mpu_acc.innerHTML = acc_html

    msgchart = false
    //update()

    end()
    start()
}

function update() {
    if (msgchart) {
        return
    }
    msgchart = true

    if (can_update) chardev.readValue()
}

function update_start() {
    can_update = true
    update()
}

function update_stop() {
    can_update = false
}

function sendCommand(msg = null, prev = null) {
    if (null != prev) {
        prev_update = prev
    }
    else {
        prev_update = can_update
    }
    can_update = false

    setTimeout(() => {
        chardev.writeValue(msg ? msg : enc.encode(document.getElementById('command').value))
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

function add_sm_row() {
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
}
