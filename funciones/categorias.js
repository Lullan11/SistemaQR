import { db } from "../firebase/firebaseconfig.js";
import { 
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/** Crear categoría */
export async function crearCategoria(data) {
  try {
    const docRef = await addDoc(collection(db, "categorias"), {
      ...data,
      createdAt: new Date()
    });
    return { id: docRef.id, ...data };
  } catch (e) {
    console.error("❌ Error al crear categoría:", e);
    throw e;
  }
}

/** Obtener todas las categorías */
export async function obtenerCategorias() {
  try {
    const q = await getDocs(collection(db, "categorias"));
    return q.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("❌ Error obteniendo categorías:", e);
    throw e;
  }
}

/** Editar categoría */
export async function editarCategoria(id, nuevosDatos) {
  try {
    await updateDoc(doc(db, "categorias", id), nuevosDatos);
    console.log("✏️ Categoría actualizada:", id);
  } catch (e) {
    console.error("❌ Error al editar categoría:", e);
    throw e;
  }
}

/** Eliminar categoría */
export async function eliminarCategoria(id) {
  try {
    await deleteDoc(doc(db, "categorias", id));
    console.log("🗑️ Categoría eliminada:", id);
  } catch (e) {
    console.error("❌ Error al eliminar categoría:", e);
    throw e;
  }
}
