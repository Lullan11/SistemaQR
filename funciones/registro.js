import { auth } from "../firebase/firebaseconfig.js";
import { createUserWithEmailAndPassword, updateProfile } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const registerForm = document.getElementById("formulario__registe");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombrec").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("pass").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // ✅ Guardamos el nombre en el perfil de Firebase Auth
    await updateProfile(userCredential.user, {
      displayName: nombre
    });

    alert("Usuario registrado: " + nombre);
    registerForm.reset();
  } catch (error) {
    alert("Error en registro: " + error.message);
  }
});
