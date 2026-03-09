'use client';

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { useEffect, useState, useCallback } from 'react';
import { useFirebase } from './provider';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'manager' | 'operator' | 'client';
}

export function useAuth() {
  const { auth } = useFirebase();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // En producción, aquí harías un fetch al perfil en Firestore
        // para obtener el rol real del usuario
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'admin', // TODO: Obtener de Firestore
        };
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error('Auth not initialized');
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  }, [auth]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    if (!auth) throw new Error('Auth not initialized');
    try {
      setError(null);
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(newUser, { displayName });
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  }, [auth]);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error('Auth not initialized');
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  }, [auth]);

  const signOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  }, [auth]);

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  };
}

function getAuthErrorMessage(code: string): string {
  const errors: Record<string, string> = {
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/user-disabled': 'Usuario deshabilitado',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'El correo ya está registrado',
    'auth/weak-password': 'La contraseña es muy débil',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
  };
  return errors[code] || 'Error de autenticación';
}

// Hook para proteger rutas
export function useRequireAuth(allowedRoles?: AuthUser['role'][]) {
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      setAuthorized(false);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      setAuthorized(false);
      return;
    }

    setAuthorized(true);
  }, [user, loading, allowedRoles]);

  return { user, loading, authorized };
}
