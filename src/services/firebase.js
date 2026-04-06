import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            "AIzaSyD-GxIGlQchPlbPVdzcFmbxA_DaK-BpjAw",
  authDomain:        "tasty-recipe-7087a.firebaseapp.com",
  projectId:         "tasty-recipe-7087a",
  storageBucket:     "tasty-recipe-7087a.firebasestorage.app",
  messagingSenderId: "830075182994",
  appId:             "1:830075182994:web:aec932630de5774fc8eb4b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
