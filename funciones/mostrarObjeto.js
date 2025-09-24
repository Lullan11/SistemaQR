import { db } from "../firebase/firebaseconfig.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

async function mostrarObjeto() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;

    const docRef = doc(db, "productos", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        document.querySelector(".main-objeto").innerHTML = "<p>Objeto no encontrado</p>";
        return;
    }

    const obj = docSnap.data();

    document.getElementById("nombreObjeto").textContent = obj.nombre;
    document.getElementById("codigoObjeto").textContent = obj.codigo;
    document.getElementById("categoriaObjeto").textContent = obj.categoriaNombre || "Sin categoría";
    document.getElementById("lugarObjeto").textContent = obj.lugar;
    document.getElementById("zonaObjeto").textContent = obj.zona;

    const camposExtraDiv = document.getElementById("camposExtra");
    camposExtraDiv.innerHTML = obj.camposExtra?.map(c => `<p><b>${c.nombre}:</b> ${c.valor}</p>`).join("") || "";

    if (obj.foto) {
        document.getElementById("fotoObjeto").src = obj.foto;
    }
}

document.addEventListener("DOMContentLoaded", mostrarObjeto);
