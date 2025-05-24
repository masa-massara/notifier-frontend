// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import firebaseConfigFromFile from "../../firebase-config.json";

// TODO: Add your Firebase project configuration here
const firebaseConfig = {
	apiKey: firebaseConfigFromFile.apiKey,
	authDomain: firebaseConfigFromFile.authDomain,
	projectId: firebaseConfigFromFile.projectId,
	storageBucket: firebaseConfigFromFile.storageBucket,
	messagingSenderId: firebaseConfigFromFile.messagingSenderId,
	appId: firebaseConfigFromFile.appId,
	measurementId: firebaseConfigFromFile.measurementId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
