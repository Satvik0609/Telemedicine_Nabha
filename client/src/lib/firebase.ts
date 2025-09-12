import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, signOut } from "firebase/auth";

// Check if Firebase config is available
const hasFirebaseConfig = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

// Only initialize Firebase if config is available
let app: any = null;
let auth: any = null;

if (hasFirebaseConfig) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    auth = null;
  }
}

export { auth };

const provider = hasFirebaseConfig ? new GoogleAuthProvider() : null;

export function login() {
  if (!auth || !provider) {
    console.warn('Firebase not configured. Login unavailable.');
    return;
  }
  signInWithRedirect(auth, provider);
}

export function logout() {
  if (!auth) {
    console.warn('Firebase not configured. Logout unavailable.');
    return Promise.resolve();
  }
  return signOut(auth);
}

export function handleRedirect() {
  if (!auth) {
    console.warn('Firebase not configured. Redirect handling unavailable.');
    return Promise.resolve(null);
  }
  
  return getRedirectResult(auth)
    .then((result) => {
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;
        return { user, token };
      }
      return null;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData?.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      throw { errorCode, errorMessage, email, credential };
    });
}
