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
      window.location.href = "../dashboard.html";
    } catch (error) {
      // 🎯 Mapeamos TODOS los errores de Firebase a mensajes claros
      let mensaje = "Error al iniciar sesión.";
      switch (error.code) {
        case "auth/user-not-found":
          mensaje = "❌ El usuario no existe. Verifica tu correo.";
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential": // ⚠️ Este es el que te estaba saliendo
          mensaje = "❌ La contraseña o el correo son incorrectos.";
          break;
        case "auth/invalid-email":
          mensaje = "❌ El correo no es válido.";
          break;
        case "auth/too-many-requests":
          mensaje = "⚠️ Demasiados intentos. Intenta más tarde.";
          break;
        default:
          mensaje = "⚠️ Ha ocurrido un error inesperado. Intenta de nuevo.";
      }
      alert(mensaje);
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
      let mensaje = "No pudimos enviar el correo.";
      switch (error.code) {
        case "auth/user-not-found":
          mensaje = "❌ No existe ninguna cuenta con ese correo.";
          break;
        case "auth/invalid-email":
          mensaje = "❌ El correo no es válido.";
          break;
        default:
          mensaje = "⚠️ Ha ocurrido un error inesperado. Intenta de nuevo.";
      }
      alert(mensaje);
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
        alert("⚠️ No pudimos cerrar la sesión. Intenta de nuevo.");
      }
    });
  }
});

// -------------------- PROTECCIÓN DE RUTAS --------------------
onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname.includes("dashboard.html")) {
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
