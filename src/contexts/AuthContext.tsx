/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider 
} from 'firebase/auth';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthorized: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const AUTHORIZED_EMAILS = (import.meta.env.VITE_AUTHORIZED_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim())
  .filter((e: string) => e);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!firebaseConfig.apiKey) {
      console.warn('Firebase not configured - auth disabled');
      setLoading(false);
      return;
    }

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    onAuthStateChanged(auth, (firebaseUser: any) => {
      setUser(firebaseUser);
      if (firebaseUser?.email) {
        const authorized = AUTHORIZED_EMAILS.length === 0 || 
          AUTHORIZED_EMAILS.includes(firebaseUser.email);
        setIsAuthorized(authorized);
      } else {
        setIsAuthorized(false);
      }
      setLoading(false);
    });
  }, []);

  const signIn = async () => {
    if (!firebaseConfig.apiKey) {
      throw new Error('Firebase not configured');
    }
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new (GoogleAuthProvider as any)();
    await signInWithPopup(auth, provider);
  };

  const signOutUser = async () => {
    if (!firebaseConfig.apiKey) return;
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthorized, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};