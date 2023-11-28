/////////////////////////////////////////////////////////////////////////////////////////////////
/// Inner types
/////////////////////////////////////////////////////////////////////////////////////////////////

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


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Export
/////////////////////////////////////////////////////////////////////////////////////////////////

export type TrPromise = Promise<IDBValidKey | IDBValidKey[] | null>

export type LogData = {
    tripindex: number,
    timestamp: number,
    ble: WSBLESensorsType,
    phone: {
        compass: number,
        orient: {
            x: number,
            y: number
        }
    },
    gps: {
        accuracy: number,
        latitude: number,
        longitude: number,
        speed: number | null
    }
}

export type TripData = {
    user: string,
    name: string,
    date: {
        start: number,
        end: number
    },
    logid: string
}
