import { auth } from "../firebase/firebaseconfig.js";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// -------------------- LOGIN --------------------
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert("Bienvenido: " + (userCredential.user.displayName || userCredential.user.email));
      window.location.href = "../inicio.html";
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    }
  });
}

// -------------------- OLVIDÉ MI CONTRASEÑA --------------------
const forgotPasswordLink = document.querySelector(".forgot-password");
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;

    if (!email) {
      alert("Por favor escribe tu correo en el campo de email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("📩 Te enviamos un enlace a tu correo para restablecer tu contraseña.");
    } catch (error) {
      alert("Error al enviar el correo de recuperación: " + error.message);
    }
  });
}

// -------------------- LOGOUT --------------------
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
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
    window.location.href = "../index.html"; 
  }
});

// -------------------- MOSTRAR NOMBRE DEL USUARIO --------------------
onAuthStateChanged(auth, (user) => {
  const userNameSpan = document.getElementById("userName");
  if (user && userNameSpan) {
    userNameSpan.textContent = user.displayName || user.email;
  }
});
