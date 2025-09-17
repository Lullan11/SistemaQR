import { auth } from "../firebase/firebaseconfig.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// -------------------- LOGIN --------------------
const loginForm = document.getElementById("login-form");
if (loginForm) { // ✅ Solo corre si existe el formulario
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert("Bienvenido: " + userCredential.user.email);
      window.location.href = "../inicio.html";
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    }
  });
}





// -------------------- LOGOUT --------------------
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) { // ✅ Solo corre si existe el botón
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        alert("Sesión cerrada ✅");
        window.location.href = "../index.html";
      } catch (error) {
        alert("Error al cerrar sesión: " + error.message);
      }
    });
  }
});

// -------------------- PROTECCIÓN DE RUTAS --------------------
onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname.includes("inicio.html")) {
    window.location.href = "../index.html"; // redirige si no hay usuario
  }
});
