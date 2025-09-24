import { crearProducto, obtenerProductos, editarProducto, eliminarProducto } from "./productos.js";
import { obtenerCategorias } from "./categorias.js";
import jsPDF from "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";


// ===== ELEMENTOS DEL DOM =====
const modalProducto = document.getElementById("modalProducto");
const btnCrearProducto = document.getElementById("btnCrearObjeto");
const listaProductos = document.getElementById("listaProductos");
const formProducto = document.getElementById("formProducto");
const btnCerrarModal = modalProducto.querySelector(".close");
const btnCancelar = modalProducto.querySelector(".btn-cancelar");
const selectCategoria = document.getElementById("categoriaProducto");
const agregarCampoBtn = document.getElementById("agregarCampoProducto");
const contenedorCampos = document.getElementById("camposProducto");

// ===== ELEMENTOS FILTROS =====
const inputBuscarNombre = document.getElementById("buscarNombre");
const inputBuscarLugar = document.getElementById("buscarLugar");
const inputBuscarZona = document.getElementById("buscarZona");
const selectFiltrarCategoria = document.getElementById("filtrarCategoria");

// ===== MODAL QR =====
const modalQR = document.getElementById("modalQR");
const qrContainer = document.getElementById("qrContainer");
const infoQR = document.getElementById("infoQR");
const btnCerrarQR = modalQR.querySelector(".close");
const btnDescargarQR = document.getElementById("descargarQR");

let editandoProductoId = null;
let productosCache = [];

// ===== FUNCIONES =====
function cerrarModal() {
    modalProducto.style.display = "none";
    formProducto.reset();
    contenedorCampos.innerHTML = "";
    editandoProductoId = null;
}

async function cargarCategoriasEnSelect() {
    try {
        const categorias = await obtenerCategorias();
        selectCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
        selectFiltrarCategoria.innerHTML = '<option value="">Todas las categorías</option>';
        categorias.forEach(cat => {
            const option1 = document.createElement("option");
            option1.value = cat.id;
            option1.textContent = cat.nombre;
            selectCategoria.appendChild(option1);

            const option2 = document.createElement("option");
            option2.value = cat.id;
            option2.textContent = cat.nombre;
            selectFiltrarCategoria.appendChild(option2);
        });
    } catch (err) {
        console.error("❌ Error cargando categorías:", err);
    }
}

// ===== CAMPOS ADICIONALES =====
agregarCampoBtn.addEventListener("click", () => {
    const div = document.createElement("div");
    div.classList.add("campo-adicional");
    div.innerHTML = `
        <input type="text" class="campo-nombre" placeholder="Nombre del campo">
        <input type="text" class="campo-valor" placeholder="Valor">
        <button type="button" class="btn-eliminar-campo">❌</button>
    `;
    div.querySelector(".btn-eliminar-campo").addEventListener("click", () => div.remove());
    contenedorCampos.appendChild(div);
});

// ===== FORMULARIO =====
formProducto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const producto = {
        categoriaId: selectCategoria.value,
        nombre: document.getElementById("nombreProducto").value.trim(),
        codigo: document.getElementById("codigoProducto").value.trim(),
        lugar: document.getElementById("lugarProducto").value.trim(),
        zona: document.getElementById("zonaProducto").value.trim(),
        camposExtra: []
    };

    if (!producto.categoriaId || !producto.nombre || !producto.codigo) {
        alert("⚠️ Complete los campos obligatorios");
        return;
    }

    contenedorCampos.querySelectorAll(".campo-adicional").forEach(div => {
        const nombre = div.querySelector(".campo-nombre").value.trim();
        const valor = div.querySelector(".campo-valor").value.trim();
        if (nombre && valor) producto.camposExtra.push({ nombre, valor });
    });

    const archivoInput = document.getElementById("fotoProducto");
    const archivo = archivoInput.files.length > 0 ? archivoInput.files[0] : null;

    try {
        if (editandoProductoId) {
            await editarProducto(editandoProductoId, producto, archivo);
            alert("✏️ Producto actualizado");
        } else {
            const nuevoProducto = await crearProducto(producto, archivo);
            productosCache.unshift(nuevoProducto);
            alert("✅ Producto creado");
        }
        mostrarProductos(productosCache);
        cerrarModal();
    } catch (err) {
        console.error("❌ Error guardando producto:", err);
        alert("❌ Error guardando producto");
    }
});

// ===== MOSTRAR PRODUCTOS =====
async function mostrarProductos(lista = []) {
    listaProductos.innerHTML = "";
    const categorias = await obtenerCategorias();

    lista.forEach(prod => {
        const categoria = categorias.find(cat => cat.id === prod.categoriaId);
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <h3>${prod.nombre}</h3>
            <p><b>Categoría:</b> ${categoria ? categoria.nombre : "Sin categoría"}</p>
            <p><b>Código:</b> ${prod.codigo}</p>
            <p><b>Ubicación:</b> ${prod.lugar} | <b>Zona:</b> ${prod.zona}</p>
            ${prod.camposExtra?.length > 0 ? `
                <div class="campos-extra">
                    ${prod.camposExtra.map(c => `<p>${c.nombre}: ${c.valor}</p>`).join("")}
                </div>` : ""}
            ${prod.foto ? `<img src="${prod.foto}" alt="foto" style="max-width:100px;">` : ""}
            <div class="card-actions">
                <button class="editar" data-id="${prod.id}"><i class="fas fa-edit"></i></button>
                <button class="eliminar" data-id="${prod.id}"><i class="fas fa-trash"></i></button>
                <button class="qr" data-id="${prod.id}"><i class="fas fa-qrcode"></i></button>
            </div>
        `;

        // Editar
        card.querySelector(".editar").addEventListener("click", async () => {
            editandoProductoId = prod.id;
            document.getElementById("nombreProducto").value = prod.nombre;
            document.getElementById("codigoProducto").value = prod.codigo;
            document.getElementById("lugarProducto").value = prod.lugar;
            document.getElementById("zonaProducto").value = prod.zona;

            await cargarCategoriasEnSelect();
            selectCategoria.value = prod.categoriaId;

            contenedorCampos.innerHTML = "";
            prod.camposExtra?.forEach(c => {
                const div = document.createElement("div");
                div.classList.add("campo-adicional");
                div.innerHTML = `
                    <input type="text" class="campo-nombre" value="${c.nombre}">
                    <input type="text" class="campo-valor" value="${c.valor}">
                    <button type="button" class="btn-eliminar-campo">❌</button>
                `;
                div.querySelector(".btn-eliminar-campo").addEventListener("click", () => div.remove());
                contenedorCampos.appendChild(div);
            });

            modalProducto.style.display = "block";
        });

        // Eliminar
        card.querySelector(".eliminar").addEventListener("click", async () => {
            if (confirm("¿Eliminar este producto?")) {
                await eliminarProducto(prod.id);
                await cargarYMostrarProductos();
            }
        });

        // Botón QR
        card.querySelector(".qr").addEventListener("click", () => {
            const prodInfo = {
                ...prod,
                categoriaNombre: categoria ? categoria.nombre : "Sin categoría"
            };
            generarQR(prodInfo);
        });

        listaProductos.appendChild(card);
    });
}

// ===== FILTROS =====
inputBuscarNombre.addEventListener("input", filtrarProductos);
inputBuscarLugar.addEventListener("input", filtrarProductos);
inputBuscarZona.addEventListener("input", filtrarProductos);
selectFiltrarCategoria.addEventListener("change", filtrarProductos);

// ===== ABRIR/CERRAR MODAL =====
btnCrearProducto.addEventListener("click", async () => {
    editandoProductoId = null;
    formProducto.reset();
    contenedorCampos.innerHTML = "";
    await cargarCategoriasEnSelect();
    modalProducto.style.display = "block";
});
btnCerrarModal.addEventListener("click", cerrarModal);
btnCancelar.addEventListener("click", cerrarModal);
window.addEventListener("click", (e) => { if (e.target === modalProducto) cerrarModal(); });

// ===== MODAL QR =====
btnCerrarQR.addEventListener("click", () => modalQR.style.display = "none");

// ===== MODAL QR =====
function generarQR(obj) {
    qrContainer.innerHTML = "";
    infoQR.innerHTML = ""; // Limpiar antes

    // Mostrar toda la info en el modal
    infoQR.innerHTML = `<br>`;

    modalQR.style.display = "block";

    // URL pública de GitHub Pages con id
    const urlObjeto = `https://lullan11.github.io/SistemaQR/objeto.html?id=${obj.id}`;

    const qr = new QRCode(qrContainer, {
        text: urlObjeto,
        width: 250,
        height: 250,
        correctLevel: QRCode.CorrectLevel.H
    });

    btnDescargarQR.onclick = () => {
        const canvas = qrContainer.querySelector("canvas");
        const tempCanvas = document.createElement("canvas");
        const size = canvas.width;
        tempCanvas.width = size;
        tempCanvas.height = size;
        const ctx = tempCanvas.getContext("2d");

        // 1️⃣ Pintar fondo blanco
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);

        // 2️⃣ Dibujar el QR encima
        ctx.drawImage(canvas, 0, 0, size, size);

        // 3️⃣ Convertir a imagen
        const imgData = tempCanvas.toDataURL("image/png");

        // 4️⃣ Crear PDF con jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.addImage(imgData, 'PNG', 20, 20, 170, 170); // ajustar tamaño
        doc.save(`${obj.nombre}_QR.pdf`);
    };
}



// ===== INICIALIZAR =====
document.addEventListener("DOMContentLoaded", async () => {
    await cargarCategoriasEnSelect();
    await cargarYMostrarProductos();
});

async function cargarYMostrarProductos() {
    productosCache = await obtenerProductos();
    productosCache.sort((a, b) => b.id - a.id);
    mostrarProductos(productosCache);
}

function filtrarProductos() {
    const nombre = inputBuscarNombre.value.toLowerCase();
    const lugar = inputBuscarLugar.value.toLowerCase();
    const zona = inputBuscarZona.value.toLowerCase();
    const categoriaId = selectFiltrarCategoria.value;

    const filtrados = productosCache.filter(prod => {
        const matchNombre = prod.nombre.toLowerCase().includes(nombre);
        const matchLugar = prod.lugar.toLowerCase().includes(lugar);
        const matchZona = prod.zona.toLowerCase().includes(zona);
        const matchCategoria = categoriaId === "" || prod.categoriaId === categoriaId;
        return matchNombre && matchLugar && matchZona && matchCategoria;
    });

    mostrarProductos(filtrados);
}
