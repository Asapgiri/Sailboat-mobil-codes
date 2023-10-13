import type { LogData } from '../components/HandleSensors'

/////////////////////////////////////////////////////////////////////////////////////////////////
/// Consts
/////////////////////////////////////////////////////////////////////////////////////////////////

const DB_NAME = 'SAILBOAT-SENSOR-DB'
const TRIP_TABLE_NAME = 'trips'
const LOGS_TABLE_NAME = 'logs'

const TRIP_TABLE_KEY = 'tripindex'
const LOGS_TABLE_KEY = 'timestamp'

const DEVICE_STORE_NAME = 'bt-device'
const SENSOR_STORE_NAME = 'sensor-data'


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Variables
/////////////////////////////////////////////////////////////////////////////////////////////////

var db: IDBDatabase
var t_trips: IDBObjectStore
var t_logs: IDBObjectStore


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Types
/////////////////////////////////////////////////////////////////////////////////////////////////

type Device = {
    name: string,
    reconnect: boolean
}


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Initialization
/////////////////////////////////////////////////////////////////////////////////////////////////

const request = window.indexedDB.open(DB_NAME)

request.onerror = (event) => {
    alert('Error opening BD:' + event)
}

request.onsuccess = (event: any) => {
    db = event.target.result
    const transaction = db.transaction([TRIP_TABLE_NAME, LOGS_TABLE_NAME], "readwrite")
    t_trips = transaction.objectStore(TRIP_TABLE_NAME)
    t_logs = transaction.objectStore(LOGS_TABLE_NAME)
}

request.onupgradeneeded = (event: any) => {
    db = event.target.result

    const t_trips = db.createObjectStore(TRIP_TABLE_NAME, { autoIncrement: true })
    const t_logs = db.createObjectStore(LOGS_TABLE_NAME, { keyPath: LOGS_TABLE_KEY })

    t_logs.createIndex(TRIP_TABLE_KEY, TRIP_TABLE_KEY, { unique: false })
    t_logs.createIndex(LOGS_TABLE_KEY, LOGS_TABLE_KEY, { unique: true})

    t_trips.transaction.oncomplete = (event) => {
        alert('Successfully created local log storage: ' + TRIP_TABLE_NAME)
    }
    t_logs.transaction.oncomplete = (event) => {
        alert('Successfully created local log storage: ' + LOGS_TABLE_NAME)
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Internals
/////////////////////////////////////////////////////////////////////////////////////////////////

function trip_create(name: string): number {
    if (!t_trips) return 0
    t_trips.add(name)
    let keys = t_trips.getAllKeys()
    console.log(keys.result)
    return keys.result
}

function trip_get(key: number) {

}

function trip_get_all() {

}

function trip_delete(key: number) {

}

function sensor_store(key: number, log: LogData): void {
    t_logs.add(log, key)
}

function sensor_load(index: number): LogData[] | null {
    const sdata = local_sensors_load_all()
    if (sdata.length < index || index < 0) {
        return null
    }
    return sdata[index]
}

function local_sensors_load_all(): LogData[][] {
    if (!localStorage.getItem(SENSOR_STORE_NAME)) {
        return []
    }
    return JSON.parse(localStorage.getItem(SENSOR_STORE_NAME))
}

function local_sensors_len(): number {
    return local_sensors_load_all().length
}

function local_sensors_clean(index: number): void {
    const sdata = local_sensors_load_all()
    if (sdata.length < index || index < 0) {
        return null
    }
    sdata.splice(index, 1)
    localStorage.setItem(SENSOR_STORE_NAME, JSON.stringify(sdata))
}

function local_sensors_clean_all(): void {
    localStorage.setItem(SENSOR_STORE_NAME, '')
}





function device_load(): Device | null {
    if (!localStorage.getItem(DEVICE_STORE_NAME)) {
        return null
    }

    return JSON.parse(localStorage.getItem(DEVICE_STORE_NAME))
}

function device_store(dev: Device): void {
    localStorage.setItem(DEVICE_STORE_NAME, JSON.stringify(dev))
}

function device_clear(): void {
    localStorage.setItem(DEVICE_STORE_NAME, '')
}





/////////////////////////////////////////////////////////////////////////////////////////////////
/// Export
/////////////////////////////////////////////////////////////////////////////////////////////////

export const localdb = {
    trip: {
        create: trip_create
    },
    sensors: {
        store:      sensor_store,
        load:       sensor_load,
        //load_all:   sensor_load_all,
        //len:        sensor_len,
        //clean:      sensor_clean,
        //clean_all:  sensor_clean_all
    },
    device: {
        load:  device_load,
        store: device_store,
        clear: device_clear
    }
}
