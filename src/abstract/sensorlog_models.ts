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

export type LogData = {
    tripindex: number,
    timestamp: number,
    ble: WSBLESensorsType,
    phone: {
        compass: number,
        orient: number[]
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
    color: string,
    logid: string
}

export type ETripData = {
    key: string,
    data: TripData
}

export type LocalTripData = {
    logid: number,
    name: string,
    color: string
}

export type DbFunctions = {
    trip: {
        create: (name: string, color?: string, logs?: LogData[]) => Promise<number | string>,   // create record        (return key)
        set:    (key: number | string, name: string) => Promise<number | string>,               // set trip name        (return key)
        get:    (key: number | string) => Promise<TripData | LocalTripData>,                    // get one record       (return trip)
        getall: () => Promise<ETripData[] | LocalTripData[]>,                                   // get all records      (return trip[])
        delete: (key: number | string) => Promise<any>,                                         // delete one record    (return success)
        clean:  () => Promise<any>                                                              // delete all records   (return success)
    },
    sensors: {
        store:  (logs: LogData[]) => Promise<number | string>,          // create record(s)         (return length or id)
        load:   (key: number | string) => Promise<LogData[]>,           // get records for trip     (return log[])
        drop:   (key: number | string) => Promise<number | string>,     // delete records for trip  (return key)
        clean:  () => Promise<any>                                      // delete all records       (return success)
    }
}
