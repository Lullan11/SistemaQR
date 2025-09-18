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
    // 🎯 Mapeamos errores de Firebase
    let mensaje = "Error en registro.";
    switch (error.code) {
      case "auth/email-already-in-use":
        mensaje = "❌ El correo ya está registrado.";
        break;
      case "auth/weak-password":
        mensaje = "⚠️ La contraseña es muy débil (mínimo 6 caracteres).";
        break;
      case "auth/invalid-email":
        mensaje = "❌ El correo no es válido.";
        break;
      default:
        mensaje = "⚠️ " + error.message;
    }
    alert(mensaje);
  }
});
