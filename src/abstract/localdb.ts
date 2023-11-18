import type { LogData } from './sensorlog_models'

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

type TrPromise = Promise<IDBValidKey | IDBValidKey[] | null>

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
    return return_tr_as_promise(t_trips.getKey(key))
}

async function trip_get_all(): TrPromise {
    await open_transaction()
    const trips = t_trips.getAll()
    return return_tr_as_promise(trips)
}

async function trip_delete(key: number) {
    await open_transaction()
    t_trips.delete(key)
}



async function sensor_store(key: number, log: LogData): void {
    await open_transaction()
    t_logs.add(log, key)
}

async function sensor_load(index: number): LogData[] | null {
    await open_transaction()
    const sdata = local_sensors_load_all()
    if (sdata.length < index || index < 0) {
        return null
    }
    return sdata[index]
}

async function local_sensors_load_all(): LogData[][] {
    await open_transaction()

}

async function local_sensors_len(): number {
    await open_transaction()
    return local_sensors_load_all().length
}

async function local_sensors_clean(index: number): void {
    await open_transaction()
    const sdata = local_sensors_load_all()
    if (sdata.length < index || index < 0) {
        return null
    }
    sdata.splice(index, 1)
    localStorage.setItem(SENSOR_STORE_NAME, JSON.stringify(sdata))
}

async function local_sensors_clean_all(): void {
    await open_transaction()
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
    open: open_transaction,
    trip: {
        create: trip_create,
        get_all: trip_get_all,
        delete: trip_delete
    },
    sensors: {
        store:      sensor_store,
        load:       sensor_load,
        load_trips: trip_get_all,
        //load_all:   local_sensors_load_all,
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
