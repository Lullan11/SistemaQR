import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";


const firebaseConfig = {
  apiKey: "AIzaSyAgBzytpIzLrz-TR04k_v7i2DLbYkPFZVE",
  authDomain: "qrcode-666ce.firebaseapp.com",
  projectId: "qrcode-666ce",
  storageBucket: "qrcode-666ce.firebasestorage.app",
  messagingSenderId: "721295004839",
  appId: "1:721295004839:web:ec696403ad909ebfc13782"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);