/////////////////////////////////////////////////////////////////////////////////////////////////
/// Include
/////////////////////////////////////////////////////////////////////////////////////////////////

import { config } from '../config'
import type { LogData, TripData } from '../abstract/sensorlog_models'
import type { App, Ref } from 'vue'
import type { _Nullable } from 'vuefire'
import type { User } from 'firebase/auth'
import { VueFire, VueFireAuth, VueFireAppCheck } from 'vuefire'
import { initializeApp } from 'firebase/app'
import { signInWithRedirect, GoogleAuthProvider, PhoneAuthProvider } from "firebase/auth";
import { useCurrentUser, useFirebaseAuth } from "vuefire";

import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
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
var user: Ref<_Nullable<User>>


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

function google_login(): void {
    console.log("login with google");
    signInWithRedirect(auth, googleAuthProvider)
    .then(() => window.location.href = '/')
    .catch((reason) => {
    alert(reason)
    console.error("Failed sign", reason);
})
}

function sensors_store(logs: LogData[]): Promise<string> {
    return new Promise((resolve, reject) => {
        if (null == user.value || undefined == user.value) {
            return reject(false)
        }

        addDoc(collection(firestoreDb, DB_TABLE_LOGS), { logs: logs })
        .then(obj => resolve(obj.id))
        .catch(err => alert('sens: '+err))
    })
}

function sensors_load(logid: string): Promise<LogData[]> {
    return new Promise((resolve, reject) => {
        if (null == user.value || undefined == user.value) {
            return reject(false)
        }

        const docref = doc(firestoreDb, DB_TABLE_LOGS, logid)
        getDoc(docref)
        .then(snapshot => {
            if (!snapshot.exists()) {
                reject("Log does not exists!")
            }
            resolve(snapshot.data().logs)
        })
        .catch(reject)
    })
}


async function trip_store(tripname: string, logs: LogData[]): Promise<string> {
    return new Promise((resolve, reject) => {
        if (null == user.value || undefined == user.value) {
            return reject(false)
        }

        if (logs.length <= 2) {
            reject("No logs passed!")
        }
        sensors_store(logs)
        .then(logid => {
            const data = {
                user: user.value.uid,
                name: tripname,
                date: {
                    start: logs[0].timestamp,
                    end: logs[logs.length - 1].timestamp
                },
                logid: logid
            }
            //alert(user.value.uid)
            //alert(tripname)
            //alert(logid)
            //alert(logs[0].timestamp)
            //alert(logs[logs.length - 1].timestamp)
            addDoc(collection(firestoreDb, DB_TABLE_TRIPS), data)
            .then(obj => resolve(obj.id))
            .catch(err => alert('trip1: '+err))
        })
        .catch(err => alert('trip2: '+err))
    })
}

async function trip_load(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
        if (null == user.value || undefined == user.value) {
            return reject(false)
        }

        const docref = doc(firestoreDb, DB_TABLE_TRIPS, key)
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

async function trip_load_all(): Promise<DocumentSnapshot<DocumentData, DocumentData>> {
    return new Promise((resolve, reject) => {
        if (null == user.value || undefined == user.value) {
            return reject(false)
        }

        const q = query(collection(firestoreDb, DB_TABLE_TRIPS), where("user", "==", user.value.uid))
        getDocs(q)
        .then(doc => resolve(doc))
        .catch(reject)
    })
}

function dummy(a: any = null, b: any = null, c: any = null, d: any = null,
               e: any = null, f: any = null, g: any = null, h: any = null,): void { }


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Export
/////////////////////////////////////////////////////////////////////////////////////////////////

export const extdb = {
    init: init,
    login: {
        phone:  phone_login,
        google: google_login
    },
    db: {
        trip: {
            store:   trip_store,
            load:    trip_load,
            loadall: trip_load_all,
            delete:  dummy
        },
        sensors: {
            load:   sensors_load,
            delete: dummy
        }
    }
}

