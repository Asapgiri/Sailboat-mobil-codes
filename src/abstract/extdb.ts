/////////////////////////////////////////////////////////////////////////////////////////////////
/// Include
/////////////////////////////////////////////////////////////////////////////////////////////////

import { config } from '../config'
import type { LogData, DbFunctions, TripData, LocalTripData, ETripData } from '../abstract/sensorlog_models'
import type { App, Ref } from 'vue'
//import type { _Nullable } from 'vuefire'
import type { User } from 'firebase/auth'
import { VueFire, VueFireAuth, VueFireAppCheck } from 'vuefire'
import { initializeApp } from 'firebase/app'
import { signInWithRedirect, GoogleAuthProvider, PhoneAuthProvider } from "firebase/auth";
import { useCurrentUser, useFirebaseAuth } from "vuefire";

import { getFirestore, collection, addDoc, getDocs,
         query, where, doc, getDoc, deleteDoc } from "firebase/firestore";
import { ReCaptchaV3Provider } from 'firebase/app-check'
import type { FirebaseApp } from "firebase/app";


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Consts
/////////////////////////////////////////////////////////////////////////////////////////////////

const DB_TABLE_TRIPS = "trips"
const DB_TABLE_LOGS  = "logs"

const firebaseApp           = initializeApp(config.firebaseConfig)
const auth                  = useFirebaseAuth()!; // only exists on client side
const googleAuthProvider    = new GoogleAuthProvider();
//const phoneAuthProvider   = new PhoneAuthProvider(auth);
//const applicationVerifier = new RecaptchaVerifier(auth, 'recapcha-container')
const firestoreDb           = getFirestore(firebaseApp)
var user: any


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Functions
/////////////////////////////////////////////////////////////////////////////////////////////////

function init(app: App<Element>) {
    app.use(VueFire, {
        firebaseApp: firebaseApp,
        modules: [
            // we will see other modules later on
            VueFireAuth(),
            //VueFireAppCheck({
            //    provider: new ReCaptchaV3Provider(config.siteKey),
            //    isTokenAutoRefreshEnabled: true
            //})
        ]
    })

    user = useCurrentUser()
}

function phone_login(phonenumber: string): void {
    window.alert('Not yet ' + phonenumber)
    //signInWithPhoneNumber(auth, login.country + login.number, phoneAuthProvider).catch((reason) => {
    //    console.error('Failed sign', reason)
    //})
}

function google_login() {
    console.log("login with google");
    return signInWithRedirect(auth, googleAuthProvider)
}

function sensors_store(logs: LogData[]): Promise<number | string> {
    return new Promise((resolve, reject) => {
        if (null == user.value || undefined == user.value) {
            return reject(false)
        }

        addDoc(collection(firestoreDb, DB_TABLE_LOGS), { logs: logs })
        .then(obj => resolve(obj.id))
        .catch(err => alert('sens: '+err))
    })
}

function sensors_load(logid: number | string): Promise<LogData[]> {
    return new Promise((resolve, reject) => {
        if (null == user.value || undefined == user.value) {
            return reject(false)
        }

        const docref = doc(firestoreDb, DB_TABLE_LOGS, logid.toString())
        getDoc(docref)
        .then(snapshot => {
            if (snapshot.exists()) {
                resolve(snapshot.data().logs)
            }
            else {
                reject("Log does not exists!")
            }
        })
        .catch(reject)
    })
}


async function trip_store(tripname: string, tripcolor?: string, logs?: LogData[]): Promise<string | number> {
    return new Promise((resolve, reject) => {
        if (null == user.value || undefined == user.value || !tripcolor || !logs) {
            return reject(false)
        }

        if (logs.length <= 2) {
            reject("No logs passed!")
        }
        sensors_store(logs)
        .then(logid => {
            const data: TripData = {
                user: user.value!.uid,
                name: tripname,
                date: {
                    start: logs[0].timestamp,
                    end: logs[logs.length - 1].timestamp
                },
                color: tripcolor,
                logid: logid.toString()
            }
            addDoc(collection(firestoreDb, DB_TABLE_TRIPS), data)
            .then(obj => resolve(obj.id))
            .catch(err => alert('trip1: '+err))
        })
        .catch(err => alert('trip2: '+err))
    })
}

async function trip_load(key: string | number): Promise<any> {
    return new Promise((resolve, reject) => {
        if (null == user.value || undefined == user.value) {
            return reject(false)
        }

        const docref = doc(firestoreDb, DB_TABLE_TRIPS, key.toString())
        getDoc(docref)
        .then(snapshot => {
            if (!snapshot.exists() || user.value.uid != snapshot.data().user) {
                reject("No snapshot or auth error!")
            }
            resolve(snapshot.data())
        })
        .catch(reject)
    })
}

async function trip_load_all(): Promise<LocalTripData[] | ETripData[]> {
    return new Promise((resolve, reject) => {
        if (null == user.value || undefined == user.value) {
            return reject(false)
        }

        const q = query(collection(firestoreDb, DB_TABLE_TRIPS), where("user", "==", user.value.uid))
        getDocs(q)
        .then(doc => {
            const trips: ETripData[] = []
            doc.forEach(trip => {
                trips.push({
                    key: trip.id,
                    data: trip.data() as TripData
                })
            })
            resolve(trips)
        })
        .catch(reject)
    })
}

async function trip_delete(key: string | number): Promise<any> {
    return new Promise((resolve, reject) => {
        trip_load(key)
        .then(() => {
            return deleteDoc(doc(firestoreDb, DB_TABLE_TRIPS, key.toString()))
        })
        .then(resolve)
        .catch(reject)
    })
}


async function sensors_drop(key: number | string): Promise<number | string> {
    return new Promise((resolve, reject) => {
        trip_load(key)
        .then((trip) => {
            return deleteDoc(doc(firestoreDb, DB_TABLE_LOGS, trip.logid))
        })
        .then(() => resolve(key))
        .catch(reject)
    })
}


async function trip_set(key: number | string, name: string): Promise<number | string> {
    // TODO: Imlement
    return new Promise((rs, rj) => {
        rj('Not implemented')
    })
}
async function trip_clean(): Promise<any> {
    // TODO: Imlement
    return new Promise((rs, rj) => {
        rj('Not implemented')
    })
}
async function sensors_clean(): Promise<any> {
    // TODO: Imlement
    return new Promise((rs, rj) => {
        rj('Not implemented')
    })
}


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Export
/////////////////////////////////////////////////////////////////////////////////////////////////

type ExtDbType = {
    init: Function,
    login: {
        phone: (phonenumber: string) => void,
        google: Function
    },
    db: DbFunctions
}

export const extdb: ExtDbType = {
    init: init,
    login: {
        phone:  phone_login,
        google: google_login
    },
    db: {
        trip: {
            create:     trip_store,
            set:        trip_set,
            get:        trip_load,
            getall:     trip_load_all,
            delete:     trip_delete,
            clean:      trip_clean
        },
        sensors: {
            store:  sensors_store,
            load:   sensors_load,
            drop:   sensors_drop,
            clean:  sensors_clean
        }
    }
}

