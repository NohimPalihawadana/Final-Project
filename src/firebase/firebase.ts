import { initializeApp, getApps } from 'firebase/app'
import { getAuth, setPersistence, inMemoryPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)

export const secondaryApp = getApps().find(a => a.name === 'secondary')
  ? getApps().find(a => a.name === 'secondary')!
  : initializeApp(firebaseConfig, 'secondary')

  export const secondaryAuth = getAuth(secondaryApp)

  setPersistence(secondaryAuth, inMemoryPersistence).catch(() => {})