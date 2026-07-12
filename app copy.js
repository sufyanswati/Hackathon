import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfIvDpFVMSGmcUTL_87I2w5pCwcWMo7_k",
  authDomain: "assignment-266ed.firebaseapp.com",
  projectId: "assignment-266ed",
  storageBucket: "assignment-266ed.firebasestorage.app",
  messagingSenderId: "1086815409025",
  appId: "1:1086815409025:web:4524017f511bd0245f8e80"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#signupForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const confirmPassword = document.querySelector("#confirmPassword").value;
    const username = document.querySelector("#username").value;
    const terms = document.querySelector("#term").checked;

    // ❌ validation FIX
    if (!terms) {
      alert("Please accept Terms of Service");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        alert("Account created successfully");

        // optional: username store (simple display only)
        console.log("Username:", username);

        window.location.href = "index.html";
      })
      .catch((error) => {
        alert(error.message);
      });
  });
});