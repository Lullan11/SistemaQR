import { auth } from "../firebase/firebaseconfig.js";
import { createUserWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const registerForm = document.getElementById("formulario__registe");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("pass").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("Usuario registrado: " + userCredential.user.email);
    registerForm.reset();
  } catch (error) {
    alert("Error en registro: " + error.message);
  }
});
