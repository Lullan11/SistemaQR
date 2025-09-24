// productos.js
import { db } from "../firebase/firebaseconfig.js";
import { 
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ⚡ Configuración Cloudinary
const CLOUD_NAME = "dnn5xn6bd";
const UPLOAD_PRESET = "productos_preset";

/** Subir imagen a Cloudinary */
async function subirImagenCloudinary(archivo) {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) throw new Error("Error subiendo imagen a Cloudinary");
    const data = await res.json();
    return { url: data.secure_url, public_id: data.public_id };
}

/** Crear producto */
export async function crearProducto(data, archivo = null) {
    try {
        let foto = "";
        let publicId = "";

        if (archivo) {
            const img = await subirImagenCloudinary(archivo);
            foto = img.url;
            publicId = img.public_id;
        }

        const docRef = await addDoc(collection(db, "productos"), {
            ...data,
            foto,
            publicId,
            createdAt: new Date()
        });

        return { id: docRef.id, ...data, foto, publicId };
    } catch (e) {
        console.error("❌ Error al crear producto:", e);
        throw e;
    }
}

/** Obtener todos los productos */
export async function obtenerProductos() {
    try {
        const q = await getDocs(collection(db, "productos"));
        return q.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("❌ Error obteniendo productos:", e);
        throw e;
    }
}

/** Editar producto */
export async function editarProducto(id, nuevosDatos, archivo = null) {
    try {
        const prodRef = doc(db, "productos", id);
        const updateData = { ...nuevosDatos };

        if (archivo) {
            const img = await subirImagenCloudinary(archivo);
            updateData.foto = img.url;
            updateData.publicId = img.public_id;
        }

        await updateDoc(prodRef, updateData);
        console.log("✏️ Producto actualizado:", id);
    } catch (e) {
        console.error("❌ Error al editar producto:", e);
        throw e;
    }
}

/** Eliminar producto */
export async function eliminarProducto(id) {
    try {
        await deleteDoc(doc(db, "productos", id));
        console.log("🗑️ Producto eliminado:", id);
    } catch (e) {
        console.error("❌ Error al eliminar producto:", e);
        throw e;
    }
}
