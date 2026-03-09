'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface FirebaseContextType {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
  isEmulator: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirestore() {
  return useFirebase().db;
}

interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const firebase = useMemo(() => {
    // Verificar que las variables de entorno estén definidas
    const missingVars = Object.entries(firebaseConfig)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.warn('Missing Firebase config:', missingVars);
    }

    // Inicializar Firebase (solo una vez)
    const app = getApps().length === 0 
      ? initializeApp(firebaseConfig)
      : getApps()[0];

    const db = getFirestore(app);
    const auth = getAuth(app);
    const storage = getStorage(app);

    const isEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';

    // Conectar a emuladores en desarrollo
    if (isEmulator && typeof window !== 'undefined') {
      try {
        connectFirestoreEmulator(db, '127.0.0.1', 8080);
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
        connectStorageEmulator(storage, '127.0.0.1', 9199);
        console.log('🔥 Connected to Firebase Emulators');
      } catch (err) {
        console.error('Failed to connect to emulators:', err);
      }
    }

    return { app, db, auth, storage, isEmulator };
  }, []);

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}
