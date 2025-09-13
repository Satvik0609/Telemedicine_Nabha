import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, signOut } from "firebase/auth";

// Firebase configuration using your project details
const firebaseConfig = {
  apiKey: "AIzaSyBdkzHhsLKPqJk5PwPPFFwjY2onsWtdRCU",
  authDomain: "telemedicine-2fc1a.firebaseapp.com",
  projectId: "telemedicine-2fc1a",
  storageBucket: "telemedicine-2fc1a.firebasestorage.app",
  messagingSenderId: "355061686159",
  appId: "1:355061686159:android:431a247a2ee1d8bd28b5fa"
};

// Initialize Firebase
let app: any = null;
let auth: any = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  auth = null;
}

export { auth };

const provider = auth ? new GoogleAuthProvider() : null;

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
