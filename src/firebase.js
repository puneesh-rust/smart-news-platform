
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    
    
  apiKey: "AIzaSyDm4AsDXSk7JolfCd6JolrGnSeh_PZlaFc",
  authDomain: "newsapp-cc9d8.firebaseapp.com",
  projectId: "newsapp-cc9d8",
  storageBucket: "newsapp-cc9d8.firebasestorage.app",
  messagingSenderId: "616278470049",
  appId: "1:616278470049:web:804cb47e60927418dd2fe0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
