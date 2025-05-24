// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// JSONファイルから設定を読み込む
import firebaseConfigFromFile from "../../firebase-config.json"; // パスは実際のファイル位置に合わせて調整してな

const firebaseConfig = {
	apiKey: firebaseConfigFromFile.apiKey,
	authDomain: firebaseConfigFromFile.authDomain,
	projectId: firebaseConfigFromFile.projectId,
	storageBucket: firebaseConfigFromFile.storageBucket,
	messagingSenderId: firebaseConfigFromFile.messagingSenderId,
	appId: firebaseConfigFromFile.appId,
	measurementId: firebaseConfigFromFile.measurementId,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
