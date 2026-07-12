// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth  , createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfIvDpFVMSGmcUTL_87I2w5pCwcWMo7_k",
  authDomain: "assignment-266ed.firebaseapp.com",
  projectId: "assignment-266ed",
  storageBucket: "assignment-266ed.firebasestorage.app",
  messagingSenderId: "1086815409025",
  appId: "1:1086815409025:web:4524017f511bd0245f8e80"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

const Btn = document.querySelector('#Btn')
Btn.addEventListener('click', (e) => {
  e.preventDefault()
  const password = document.querySelector('#password').value
  const email = document.querySelector('#email').value

  createUserWithEmailAndPassword(auth, email, password)
  // inputs
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
      alert('creating acccount ....')
      window.location.href = 'test.html'
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage)
      // ..
    });
})

