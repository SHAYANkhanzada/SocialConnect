// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRbj0uB0EpXlfzuQoC0h5oz6XPYfQClaQ",
  authDomain: "socialconnect-76631.firebaseapp.com",
  projectId: "socialconnect-76631",
  storageBucket: "socialconnect-76631.firebasestorage.app",
  messagingSenderId: "273488932188",
  appId: "1:273488932188:web:fed8828a7a7644aa3a6599",
  measurementId: "G-0K4WTGPB2F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);