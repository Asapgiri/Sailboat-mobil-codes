/////////////////////////////////////////////////////////////////////////////////////////////////
/// Include
/////////////////////////////////////////////////////////////////////////////////////////////////

import { config } from '../config'
import type { LogData } from '../components/HandleSensors'
import type { App, Ref } from 'vue'
import type { _Nullable } from 'vuefire'
import type { User } from 'firebase/auth'
import { VueFire, VueFireAuth, VueFireAppCheck } from 'vuefire'
import { initializeApp } from 'firebase/app'
import { signInWithRedirect, GoogleAuthProvider, PhoneAuthProvider } from "firebase/auth";
import { useCurrentUser, useFirebaseAuth } from "vuefire";

import { getFirestore, collection, addDoc } from "firebase/firestore";
import { ReCaptchaV3Provider } from 'firebase/app-check'
import type { FirebaseApp } from "firebase/app";


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Types
/////////////////////////////////////////////////////////////////////////////////////////////////

type Device = {
    name: string,
    reconnect: boolean
}


/////////////////////////////////////////////////////////////////////////////////////////////////
/// Consts
/////////////////////////////////////////////////////////////////////////////////////////////////

const firebaseApp           = initializeApp(config.firebaseConfig)
const auth                  = useFirebaseAuth()!; // only exists on client side
const googleAuthProvider    = new GoogleAuthProvider();
//const phoneAuthProvider   = new PhoneAuthProvider(auth);
//const applicationVerifier = new RecaptchaVerifier(auth, 'recapcha-container')
const firestoreDb           = getFirestore(firebaseApp)
var user: Ref<_Nullable<User>>


const DEVICE_STORE_NAME = 'bt-device'
const SENSOR_STORE_NAME = 'sensor-data'


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

function sensors_store(logs: LogData[][]): boolean {
    if (null == user.value || undefined == user.value) {
        return false
    }

    logs.forEach(log => {
        addDoc(collection(firestoreDb, '/sensor-data'), { user: user.value.uid, logs: log })
        .catch(error => {
            alert(error)
            return false
        })
    })

    return true
}

function sensors_load(index: number, count: number = 1): LogData[][] | null {

    return null
}




function local_sensors_store(logs: LogData[][]): void {
    var sdata = local_sensors_load_all()

    logs.forEach(log => sdata.unshift(log))

    localStorage.setItem(SENSOR_STORE_NAME, JSON.stringify(sdata))
}

function local_sensors_load(index: number): LogData[] | null {
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

export const repo = {
    init: init,
    login: {
        phone:  phone_login,
        google: google_login
    },
    db: {
        sensors: {
            store:  sensors_store,
            load:   sensors_load
        }
    },
    local: {
        sensors: {
            store:      local_sensors_store,
            load:       local_sensors_load,
            load_all:   local_sensors_load_all,
            len:        local_sensors_len,
            clean:      local_sensors_clean,
            clean_all:  local_sensors_clean_all
        },
        device: {
            load:  device_load,
            store: device_store,
            clear: device_clear
        }
    }
}


