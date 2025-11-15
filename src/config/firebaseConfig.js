import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC4dT3XY6vStM6QH1SF9qicZoVJ9kbMpxg",
  authDomain: "portfolio-imagedb.firebaseapp.com",
  projectId: "portfolio-imagedb",
  storageBucket: "portfolio-imagedb.appspot.com",
  messagingSenderId: "476468158189",
  appId: "1:476468158189:web:0ab150c9faa06934cc36e4",
  measurementId: "G-LD8S8JHJEW"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
