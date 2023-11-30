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
    height: "500px",
    center: [47.497913,19.040236],
    line: {
        color: "#FFA500",
        width: 3.5
    }
}

const view = {
    colors: [ '#F0F8FF', '#FAEBD7', '#00FFFF', '#7FFFD4', '#F0FFFF', '#F5F5DC', '#FFE4C4', '#FFEBCD', '#DEB887', '#5F9EA0', '#7FFF00', '#D2691E', '#FF7F50', '#6495ED', '#FFF8DC', '#DC143C', '#00FFFF', '#008B8B', '#B8860B', '#A9A9A9', '#A9A9A9', '#BDB76B', '#556B2F', '#FF8C00', '#9932CC', '#E9967A', '#8FBC8F', '#00CED1', '#FF1493', '#00BFFF', '#1E90FF', '#FFFAF0', '#DCDCDC', '#FFD700', '#DAA520', '#ADFF2F', '#F0FFF0', '#FF69B4', '#CD5C5C', '#FFFFF0', '#F0E68C', '#E6E6FA', '#FFF0F5', '#7CFC00', '#FFFACD', '#ADD8E6', '#F08080', '#E0FFFF', '#FAFAD2', '#D3D3D3', '#D3D3D3', '#90EE90', '#FFB6C1', '#FFA07A', '#20B2AA', '#87CEFA', '#778899', '#778899', '#B0C4DE', '#FFFFE0', '#00FF00', '#32CD32', '#FAF0E6', '#FF00FF', '#66CDAA', '#BA55D3', '#9370DB', '#3CB371', '#7B68EE', '#00FA9A', '#48D1CC', '#C71585', '#FFE4E1', '#FFE4B5', '#FFDEAD', '#FDF5E6', '#6B8E23', '#FFA500', '#DA70D6', '#EEE8AA', '#98FB98', '#AFEEEE', '#DB7093', '#FFEFD5', '#FFDAB9', '#CD853F', '#FFC0CB', '#DDA0DD', '#B0E0E6', '#BC8F8F', '#4169E1', '#FA8072', '#F4A460', '#2E8B57', '#FFF5EE', '#A0522D', '#C0C0C0', '#87CEEB', '#6A5ACD', '#708090', '#708090', '#00FF7F', '#4682B4', '#D2B48C', '#008080', '#D8BFD8', '#FF6347', '#40E0D0', '#EE82EE', '#F5DEB3', '#FFFF00', '#9ACD32' ]
}        

export const config = {
    firebaseConfig: firebaseConfig,
    mapbox: mapbox,
    view: view,
    extendedView: true
}

//process.env.FIREBASE_API_KEY
