import type { LogData, TrPromise } from './sensorlog_models'

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

function return_tr_as_promise(t: IDBRequest<IDBValidKey[]> | undefined): TrPromise {
    return new Promise((resolve, reject) => {
        if (undefined == t) {
            resolve(null)
            return
        }
        t.onsuccess = (err: any) => {
            resolve(t.result)
        }
        t.onerror = (err: any) => {
            console.log(err)
            reject()
        }
    })
}

function trip_create(name: string): TrPromise {
    open_transaction()
    if (!t_trips) return new Promise((resolve, reject) => reject())

    t_trips.add(name)
    const keys = t_trips.getAllKeys()

    return return_tr_as_promise(keys)
}

async function trip_get(key: number): TrPromise {
    await open_transaction()
    return return_tr_as_promise(t_trips.get(key))
}

async function trip_get_all() {
    await open_transaction()
    var request = t_trips.getAllKeys()
    var ret: {key: any, value: any}[] = []

    return new Promise((resolve, reject) => {
        request.onsuccess = (event: any) => {
            let keys = request.result
            request = t_trips.getAll()
            request.onsuccess = (event: any) => {
                let values = request.result
                let i = 0
                keys.forEach(key => ret.push({key: key, value: values[i++]}))
                resolve(ret)
            }
            request.onerror = (err: any) => {
                console.log(err)
                reject()
            }
        }
        request.onerror = (err: any) => {
            console.log(err)
            reject()
        }
    })
}

async function trip_delete(key: number) {
    await open_transaction()
    t_trips.delete(key)
}



async function sensor_store(log: LogData) {
    await open_transaction()
    t_logs.add(log)
}

async function sensor_load(key: number): TrPromise {
    await open_transaction()
    const all_logs = t_logs.getAll()

    return new Promise((resolve, reject) => {
        all_logs.onsuccess = (err: any) => {
            const relevant_logs = []
            all_logs.result.forEach(log => {
                if (log.tripindex == key) {
                    relevant_logs.push(log)
                }
            })
            resolve(relevant_logs)
        }
        all_logs.onerror = (err: any) => {
            console.log(err)
            reject()
        }
    })
}

async function local_sensors_clean(key: number) {
    await open_transaction()
    t_logs.delete(key)
}

async function local_sensors_clean_all() {
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

export const localdb = {
    open: open_transaction,
    trip: {
        create: trip_create,
        get: trip_get,
        get_all: trip_get_all,
        delete: trip_delete
    },
    sensors: {
        store:          sensor_store,
        load:           sensor_load,
        //load_for_trips: trip_get_all,
        clean:          local_sensors_clean,
        clean_all:      local_sensors_clean_all
    },
    device: {
        load:  device_load,
        store: device_store,
        clear: device_clear
    }
}
