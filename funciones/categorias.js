import { db } from "../firebase.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 👉 Crear categoría
export async function crearCategoria(nombre) {
  try {
    const docRef = await addDoc(collection(db, "categorias"), {
      nombre,
      createdAt: new Date()
    });
    console.log("Categoría creada con ID:", docRef.id);
  } catch (e) {
    console.error("Error al crear categoría:", e);
  }
}

// 👉 Obtener categorías
export async function obtenerCategorias() {
  const querySnapshot = await getDocs(collection(db, "categorias"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
