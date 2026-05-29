/** Конфиг Firebase из переменных Vite (см. .env.example) */
export const getFirebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

export const isFirebaseConfigured = () =>
  Boolean(import.meta.env.VITE_FIREBASE_API_KEY?.trim());

/** Вход через Firebase, если задан apiKey и не выключено явно */
export const USE_FIREBASE_AUTH =
  isFirebaseConfigured() &&
  import.meta.env.VITE_USE_FIREBASE_AUTH !== "false";
