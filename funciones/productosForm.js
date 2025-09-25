import { crearProducto, obtenerProductos, editarProducto, eliminarProducto } from "./productos.js";
import { obtenerCategorias } from "./categorias.js";

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
let categoriasCache = [];

// ===== FUNCIONES =====
function cerrarModal() {
    modalProducto.style.display = "none";
    formProducto.reset();
    contenedorCampos.innerHTML = "";
    editandoProductoId = null;
}

async function cargarCategoriasEnSelect() {
    try {
        categoriasCache = await obtenerCategorias();
        
        // Limpiar y cargar select de categorías (para formulario)
        selectCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
        categoriasCache.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.nombre;
            selectCategoria.appendChild(option);
        });

        // Limpiar y cargar select de filtro (manteniendo "Sin categoría")
        const valorSeleccionado = selectFiltrarCategoria.value; // Guardar selección actual
        selectFiltrarCategoria.innerHTML = `
            <option value="">Todas las categorías</option>
            <option value="__sinCategoria__">Sin categoría</option>
        `;
        
        categoriasCache.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.nombre;
            selectFiltrarCategoria.appendChild(option);
        });

        // Restaurar selección anterior si existe
        if (valorSeleccionado && selectFiltrarCategoria.querySelector(`option[value="${valorSeleccionado}"]`)) {
            selectFiltrarCategoria.value = valorSeleccionado;
        }
    } catch (err) {
        console.error("❌ Error cargando categorías:", err);
    }
}

// Función para verificar si una categoría existe
function categoriaExiste(categoriaId) {
    if (!categoriaId) return false;
    return categoriasCache.some(cat => cat.id === categoriaId);
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
            await crearProducto(producto, archivo);
            alert("✅ Producto creado");
        }
        // Recargar productos y aplicar el filtro actual
        await cargarYMostrarProductos();
        filtrarProductos(); // ← ESTA ES LA CLAVE: aplicar el filtro actual después de guardar
        cerrarModal();
    } catch (err) {
        console.error("❌ Error guardando producto:", err);
        alert("❌ Error guardando producto");
    }
});

// ===== MOSTRAR PRODUCTOS =====
async function mostrarProductos(lista = []) {
    listaProductos.innerHTML = "";
    
    // Asegurarnos de que las categorías estén cargadas
    if (categoriasCache.length === 0) {
        await cargarCategoriasEnSelect();
    }

    lista.forEach(prod => {
        // Verificar si la categoría del producto aún existe
        const categoriaValida = categoriaExiste(prod.categoriaId);
        const categoria = categoriaValida ? categoriasCache.find(cat => cat.id === prod.categoriaId) : null;
        
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
            
            // Solo establecer la categoría si aún existe
            if (categoriaExiste(prod.categoriaId)) {
                selectCategoria.value = prod.categoriaId;
            } else {
                selectCategoria.value = ""; // Sin categoría si fue eliminada
            }

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

        // Eliminar - CORREGIDO: aplicar filtro después de eliminar
        card.querySelector(".eliminar").addEventListener("click", async () => {
            if (confirm("¿Eliminar este producto?")) {
                await eliminarProducto(prod.id);
                // Recargar productos y mantener el filtro actual
                productosCache = await obtenerProductos();
                productosCache.sort((a, b) => b.id - a.id);
                filtrarProductos(); // ← ESTA ES LA CLAVE: aplicar el filtro actual
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
    infoQR.innerHTML = "<br>";
    modalQR.style.display = "block";

    const urlObjeto = `https://lullan11.github.io/SistemaQR/objeto.html?id=${obj.id}`;

    const qr = new QRCode(qrContainer, {
        text: urlObjeto,
        width: 250,
        height: 250,
        correctLevel: QRCode.CorrectLevel.H
    });

    btnDescargarQR.onclick = () => {
        const canvas = qrContainer.querySelector("canvas");
        const copyCanvas = document.createElement("canvas");
        copyCanvas.width = canvas.width;
        copyCanvas.height = canvas.height;
        const copyCtx = copyCanvas.getContext("2d");

        // Fondo blanco
        copyCtx.fillStyle = "#ffffff";
        copyCtx.fillRect(0, 0, copyCanvas.width, copyCanvas.height);

        // Copiar QR encima
        copyCtx.drawImage(canvas, 0, 0);

        const url = copyCanvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `${obj.nombre}_QR.png`;
        a.click();
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
    // No llamar a mostrarProductos directamente, usar filtrarProductos para aplicar filtros actuales
    filtrarProductos();
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

        let matchCategoria = true;
        
        if (categoriaId === "__sinCategoria__") {
            // Mostrar productos que NO tienen categoría válida
            matchCategoria = !categoriaExiste(prod.categoriaId);
        } else if (categoriaId !== "") {
            // Mostrar productos de una categoría específica
            matchCategoria = categoriaExiste(prod.categoriaId) && prod.categoriaId === categoriaId;
        }
        // Si categoriaId es "", mostrar todos (matchCategoria sigue siendo true)

        return matchNombre && matchLugar && matchZona && matchCategoria;
    });

    mostrarProductos(filtrados);
}