import { config } from '@/config'
import type { DbFunctions, LocalTripData, LogData, TripData } from './sensorlog_models'

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

export var LocalDbInit: Function[] = []


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

async function open_transaction() {
    //while (!db) { return false }
    const transaction = db.transaction([TRIP_TABLE_NAME, LOGS_TABLE_NAME], "readwrite")
    t_trips = transaction.objectStore(TRIP_TABLE_NAME)
    t_logs = transaction.objectStore(LOGS_TABLE_NAME)
}

request.onerror = (event) => {
    alert('Error opening BD:' + event)
}

request.onsuccess = (event: any) => {
    db = event.target.result
    LocalDbInit.forEach(fun => fun())
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

async function trip_create(name: string): Promise<number | string> {
    await open_transaction()
    return new Promise((resolve, reject) => {
        const tripadd = t_trips.add({
            name: name,
            color: config.view.colors[Math.floor(Math.random() * config.view.colors.length)]
        })
        //tripadd.onerror = reject
        tripadd.onsuccess = (ev: Event) => {
            const keys = t_trips.getAllKeys()
            keys.onerror = reject
            keys.onsuccess = (ev: Event) => {
                let res = keys.result as number[]
                resolve(res[res.length - 1])
            }
        }
    })
}

async function trip_get(key: number | string): Promise<TripData | LocalTripData> {
    await open_transaction()
    return new Promise((resolve, reject) => {
        if (typeof(key) == 'string') {
            key = parseInt(key)
        }
        const tripget = t_trips.get(key)
        tripget.onerror = reject
        tripget.onsuccess = (ev: Event) => {
            var trip: LocalTripData = { name: tripget.result.name, logid: key as number, color: tripget.result.color }
            resolve(trip)
        }
    })
}

async function trip_get_all(): Promise<TripData[] | LocalTripData[]> {
    await open_transaction()
    var request = t_trips.getAllKeys()
    var ret: LocalTripData[] = []

    return new Promise((resolve, reject) => {
        request.onsuccess = (event: any) => {
            let keys = request.result as number[]
            request = t_trips.getAll()
            request.onsuccess = (event: any) => {
                let values = request.result as LocalTripData[]
                let i = 0
                keys.forEach(key => {
                    ret.push({logid: key, name: values[i].name, color: values[i].color})
                    i++
                })
                resolve(ret)
            }
            request.onerror = reject
        }
        request.onerror = reject
    })
}

async function trip_delete(key: number | string) {
    await open_transaction()
    return new Promise((resolve, reject) => {
        const tripdelete = t_trips.delete(key)
        tripdelete.onerror = reject
        tripdelete.onsuccess = (ev: Event) => {
            resolve(tripdelete.result)
        }
    })
}

async function trip_clean() {
    await open_transaction()
    t_trips.clear()
}



async function sensor_store(logs: LogData[]): Promise<number | string> {
    await open_transaction()
    for (let i = 0; i < logs.length; i++) {
        await t_logs.add(logs[i])
    }
    return new Promise((resolve, reject) => {
        resolve(logs.length)
    })
}

async function sensor_load(key: number | string): Promise<LogData[]> {
    await open_transaction()
    const all_logs = t_logs.getAll()

    return new Promise((resolve, reject) => {
        all_logs.onsuccess = (err: any) => {
            var relevant_logs: LogData[] = []
            all_logs.result.forEach((log: LogData) => {
                if (log.tripindex == key) {
                    relevant_logs.push(log)
                }
            })
            resolve(relevant_logs)
        }
        all_logs.onerror = reject
    })
}

async function local_sensors_delete(key: number | string): Promise<number | string> {
    await open_transaction()
    return new Promise((resolve, reject) => {
        const logs = t_logs.openCursor()
        logs.onerror = reject
        logs.onsuccess = (err: any) => {
            const cursor = logs.result
            if (cursor ) {
                if (cursor.value.tripindex == key) {
                    cursor.delete()
                }
                cursor.continue()
            }
            resolve(key)
        }
    })
}

async function local_sensors_clean() {
    await open_transaction()
    t_logs.clear()
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

type LocalDbType = DbFunctions & {
    open: Function,
    device: {
        load:  () => Device | null,
        store: (dev: Device) => void,
        clear: () => void
    }
}

export const localdb: LocalDbType = {
    open: open_transaction,
    trip: {
        create: trip_create,
        set:    null,
        get:    trip_get,
        getall: trip_get_all,
        delete: trip_delete,
        clean:  trip_clean
    },
    sensors: {
        store:  sensor_store,
        load:   sensor_load,
        drop:   local_sensors_delete,
        clean:  local_sensors_clean
    },
    device: {
        load:  device_load,
        store: device_store,
        clear: device_clear
    }
}
