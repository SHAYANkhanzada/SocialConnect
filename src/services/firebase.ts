import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCRbj0uB0EpXlfzuQoC0h5oz6XPYfQClaQ",
  authDomain: "socialconnect-76631.firebaseapp.com",
  projectId: "socialconnect-76631",
  storageBucket: "socialconnect-76631.firebasestorage.app",
  messagingSenderId: "273488932188",
  appId: "1:273488932188:web:fed8828a7a7644aa3a6599",
  measurementId: "G-0K4WTGPB2F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
