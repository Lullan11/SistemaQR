import { db } from "../firebase/firebaseconfig.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { obtenerCategorias } from "./categorias.js"; // 👈 Reusar la misma función

async function mostrarObjeto() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        document.querySelector(".main-objeto").innerHTML = "<p>ID no proporcionado</p>";
        return;
    }

    try {
        // 1. Obtener producto
        const docRef = doc(db, "productos", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            document.querySelector(".main-objeto").innerHTML = "<p>Objeto no encontrado</p>";
            return;
        }

        const obj = { id: docSnap.id, ...docSnap.data() };

        // 2. Cargar categorías
        const categorias = await obtenerCategorias();
        let categoriaNombre = "Sin categoría";

        if (obj.categoriaId) {
            const categoria = categorias.find(cat => cat.id === obj.categoriaId);
            if (categoria) {
                categoriaNombre = categoria.nombre;
            }
        }

        // 3. Renderizar objeto
        const card = document.createElement("div");
        card.classList.add("card-objeto");
        card.innerHTML = `
            <h1 id="nombreObjeto">${obj.nombre || "Sin nombre"}</h1>
            ${obj.foto ? `<img id="fotoObjeto" src="${obj.foto}" alt="Foto del objeto" style="max-width: 300px;">` : ""}
            <p><b>Código:</b> <span id="codigoObjeto">${obj.codigo || "Sin código"}</span></p>
            <p><b>Categoría:</b> <span id="categoriaObjeto">${categoriaNombre}</span></p>
            <p><b>Lugar:</b> <span id="lugarObjeto">${obj.lugar || "No especificado"}</span> | <b>Zona:</b> <span id="zonaObjeto">${obj.zona || "No especificado"}</span></p>
            <div id="camposExtra">
                ${obj.camposExtra?.map(c => `<p><b>${c.nombre}:</b> ${c.valor}</p>`).join("") || "<p>No hay campos adicionales</p>"}
            </div>
        `;

        const main = document.querySelector(".main-objeto");
        main.innerHTML = ""; // limpiar antes
        main.appendChild(card);

    } catch (error) {
        console.error("❌ Error al mostrar objeto:", error);
        document.querySelector(".main-objeto").innerHTML = "<p>Error al cargar el objeto</p>";
    }
}

document.addEventListener("DOMContentLoaded", mostrarObjeto);
