/////////////////////////////////////////////////////////////////////////////////////////////////
/// Include
/////////////////////////////////////////////////////////////////////////////////////////////////

import { config } from '../config'
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
/// Consts
/////////////////////////////////////////////////////////////////////////////////////////////////

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
            //store:
            //get:
            //getall:
            //delete:
        },
        sensors: {
            store:  sensors_store,
            load:   sensors_load,
            //delete:
        }
    }
}

