import { db, storage } from "../firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

export async function crearProducto(data, archivo) {
  try {
    let fotoURL = "";
    
    if (archivo) {
      const storageRef = ref(storage, `productos/${Date.now()}-${archivo.name}`);
      const snapshot = await uploadBytes(storageRef, archivo);
      fotoURL = await getDownloadURL(snapshot.ref);
    }

    const docRef = await addDoc(collection(db, "productos"), {
      categoria: data.categoria,
      nombre: data.nombre,
      codigo: data.codigo,
      lugar: data.lugar,
      zona: data.zona,
      foto: fotoURL,
      camposExtra: data.camposExtra || [],
      createdAt: new Date()
    });

    console.log("Producto creado con ID:", docRef.id);
  } catch (e) {
    console.error("Error al crear producto:", e);
  }
}
