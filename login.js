// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth  , signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


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

// const Btn = document.querySelector('.Btn')
// Btn.addEventListener('submit', (e) => {
//   e.preventDefault()
//   const password = document.querySelector('#password').value
//   const email = document.querySelector('.email').value

//   signInWithEmailAndPassword(auth, email, password)
//   // inputs
//     .then((userCredential) => {
//       // Signed up 
//       const user = userCredential.user;
//       alert('Login Sucessfull ....')
//       window.location.href = 'test.html'
//       // ...
//     })
//     .catch((error) => {
//       const errorCode = error.code;
//       const errorMessage = error.message;
//       alert(errorMessage)
//       // ..
//     });
// })

const form = document.querySelector('#loginForm');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const password = document.querySelector('#password').value;
  const email = document.querySelector('.email').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert('Login Successful');
      window.location.href = 'mainPage.html';
    })
    .catch((error) => {
      alert(error.message);
    });
});