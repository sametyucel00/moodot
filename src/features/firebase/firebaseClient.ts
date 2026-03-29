import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { INTEGRATIONS } from '@/src/constants/integrations';

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;

const getFirebaseApp = (): FirebaseApp => {
  if (appInstance) {
    return appInstance;
  }

  const existing = getApps()[0];
  appInstance = existing ?? initializeApp(INTEGRATIONS.firebase);
  return appInstance;
};

export const getFirebaseFirestore = (): Firestore => {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  firestoreInstance = getFirestore(getFirebaseApp(), INTEGRATIONS.firebase.firestoreDatabaseId);
  return firestoreInstance;
};

export const initializeFirebaseAuth = () => {
  const app = getFirebaseApp();
  return getAuth(app);
};
