import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirebaseConfig, isFirebaseConfigured } from "../config/firebaseEnv";

let app = null;
let auth = null;
let db = null;
let analyticsInitStarted = false;

export const getFirebaseApp = () => {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase не настроен: добавьте VITE_FIREBASE_* в .env");
  }

  if (!app) {
    const existing = getApps();
    app = existing.length ? existing[0] : initializeApp(getFirebaseConfig());
  }

  return app;
};

export const getFirebaseAuth = () => {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
};

export const getFirebaseDb = () => {
  if (!db) {
    const app = getFirebaseApp();
    try {
      // Помогает, если обычное WebChannel блокируется (прокси, VPN, Render)
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch {
      db = getFirestore(app);
    }
  }
  return db;
};

/** Analytics только в браузере (не на SSR и не при отсутствии measurementId) */
export const initFirebaseAnalytics = async () => {
  if (analyticsInitStarted || typeof window === "undefined") return;
  analyticsInitStarted = true;

  const { measurementId } = getFirebaseConfig();
  if (!measurementId || !(await isSupported())) return;

  getAnalytics(getFirebaseApp());
};
