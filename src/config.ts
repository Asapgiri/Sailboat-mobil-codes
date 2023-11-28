import { env } from '../env.d'

// Import the functions you need from the SDKs you need
//import getAnalytics from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: "sailboat-multimeter.firebaseapp.com",
    projectId: "sailboat-multimeter",
    storageBucket: "sailboat-multimeter.appspot.com",
    messagingSenderId: env.FIREBASE_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
    measurementId: env.FIREBASE_MEASUREMENT_ID
}

const mapbox = {
    token: env.MAPBOX_API_TOKEN,
    //style: "mapbox://styles/mapbox/light-v11",
    //style: "mapbox://styles/mapbox/navigation-night-v1",
    style: "mapbox://styles/mapbox/streets-v12",
    height: "600px",
    center: [47.497913,19.040236],
    line: {
        color: "#FFA500",
        width: 8
    }
}

export const config = {
    firebaseConfig: firebaseConfig,
    mapbox: mapbox,
    extendedView: true
}

//process.env.FIREBASE_API_KEY
