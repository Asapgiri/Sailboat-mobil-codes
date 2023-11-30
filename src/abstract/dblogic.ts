import type { DbFunctions, LocalTripData, LogData, TripData } from './sensorlog_models'
import { repo } from './repository'


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Functions
/////////////////////////////////////////////////////////////////////////////////////////////////

async function trip_create_dummy(): Promise<any> {
    return new Promise((resolve, reject) => {
        repo.local.open()
        .then(() => repo.local.trip.create((Math.random() * 100).toString()))
        .then((new_key: number) => {
            let logs: LogData[] = []
            for (let i = 0; i < 5; i++) {
                logs.push({
                    tripindex: new_key,
                    ble: {
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
                    phone: {
                        compass: 0,
                        orient: [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                    }, gps: {
                        accuracy: 0,
                        latitude: Math.random() * 100 - 50,
                        longitude: Math.random() * 100 - 50,
                        speed: 0
                    },
                    timestamp: new Date().getTime() + i
                })
            }
            repo.local.sensors.store(logs)
            .then(resolve)
        })
        .catch(reject)
    })
}

async function trip_create(repo: DbFunctions, name: string): Promise<number | string> {
    return repo.trip.create(name)
}

async function trip_getall(repo: DbFunctions) {
    return repo.trip.getall()
}

async function sync_trip(key: number): Promise<string> {
    return new Promise((resolve, reject) => {
        repo.local.trip.get(key)
        .then(trip => {
            repo.local.sensors.load(key)
            .then(logs => {
                repo.db.trip.create(trip.name, trip.color, logs)
                .then((newid) => {
                    repo.local.trip.delete(key)
                    repo.local.sensors.drop(key)
                    resolve(newid.toString())
                })
            })
        })
        .catch(reject)
    })
}

async function sync_all_trips(update_progress: (progress: Progress) => void): Promise<any> {
    return new Promise((resolve, reject) => {
        repo.local.open()
        .then(repo.local.trip.getall)
        .then((trips: LocalTripData[]) => {
            var progress: Progress = { current: 0, all: trips.length }
            const lats_trip_key = trips[trips.length -1].logid
            trips.forEach(async trip => {
                const logs = await repo.local.sensors.load(trip.logid)
                await repo.db.trip.create(trip.name, trip.color, logs)
                progress.current++
                update_progress(progress)
                if (trip.logid == lats_trip_key) {
                    repo.local.trip.clean()
                    repo.local.sensors.clean()
                    resolve(true)
                }
            })
        })
        .catch(reject)
    })
}

async function trip_delete(key: number | string) {
    var rep = repo.db
    if (typeof(key) == 'number') {update_progress
        rep = repo.local
    }
    console.log(key, typeof(key))

    return new Promise((resolve, reject) => {
        rep.sensors.drop(key)
        .then(rep.trip.delete)
        .then(resolve)
        .catch(reject)
    })
}

async function load_trip_w_logs(rep: DbFunctions, key: number | string): Promise<{ trip: TripData | LocalTripData, logs: LogData[]}> {
    var trip_ret: TripData | LocalTripData
    var logs_ret: LogData[]

    return new Promise((resolve, reject) => {
        rep.trip.get(key)
        .then(trip => {
            trip_ret = trip
            console.log(trip)
            rep.sensors.load(trip.logid)
            .then(logs => {
                logs_ret = logs
                resolve({trip: trip_ret, logs: logs_ret})
            })
        })
        .catch(reject)
    })
}


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Export
/////////////////////////////////////////////////////////////////////////////////////////////////

export type Progress = {
    current: number,
    all: number
}

export const logic = {
    sync: sync_trip,
    syncall: sync_all_trips,
    delete: trip_delete,
    load: load_trip_w_logs,
    dummy: {
        create: trip_create_dummy
    }
}
