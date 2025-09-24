import { 
  crearCategoria, 
  obtenerCategorias, 
  editarCategoria, 
  eliminarCategoria 
} from "./categorias.js";

const modalCategoria = document.getElementById("modalCategoria");
const btnCrearCategoria = document.getElementById("btnCrearCategoria");
const listaCategorias = document.getElementById("listaCategorias");
const formCategoria = document.getElementById("formCategoria");

// 👇 nuevos elementos
const btnCerrarModal = modalCategoria.querySelector(".close");
const btnCancelar = modalCategoria.querySelector(".btn-cancelar");
const inputBuscarCategoria = document.getElementById("buscarCategoria");

let categorias = [];
let editandoCategoriaId = null;

// 👉 Función para cerrar modal
function cerrarModal() {
  modalCategoria.style.display = "none";
  formCategoria.reset();
  editandoCategoriaId = null;
}

// Abrir modal
btnCrearCategoria.addEventListener("click", () => {
  editandoCategoriaId = null;
  formCategoria.reset();
  modalCategoria.style.display = "block";
});

// Guardar categoría
formCategoria.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombreCategoria = document.getElementById("nombreCategoria").value.trim();
  if (!nombreCategoria) return alert("⚠️ Nombre inválido");

  if (editandoCategoriaId) {
    await editarCategoria(editandoCategoriaId, { nombre: nombreCategoria });
  } else {
    await crearCategoria({ nombre: nombreCategoria });
  }

  await mostrarCategorias();
  cerrarModal();
});

// 👉 Cerrar con la X
btnCerrarModal.addEventListener("click", cerrarModal);

// 👉 Cerrar con Cancelar
btnCancelar.addEventListener("click", cerrarModal);

// 👉 Cerrar si se hace clic fuera del modal
window.addEventListener("click", (e) => {
  if (e.target === modalCategoria) {
    cerrarModal();
  }
});

// 👉 Mostrar categorías
export async function mostrarCategorias() {
  listaCategorias.innerHTML = "";
  categorias = await obtenerCategorias();
  renderizarCategorias(categorias);
}

// 👉 Renderizar categorías (usado por mostrarCategorias y búsqueda)
function renderizarCategorias(lista) {
  listaCategorias.innerHTML = "";
  lista.forEach(cat => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h3>${cat.nombre}</h3>
      <div class="card-actions">
        <button class="editar" data-id="${cat.id}"><i class="fas fa-edit"></i></button>
        <button class="eliminar" data-id="${cat.id}"><i class="fas fa-trash"></i></button>
      </div>
    `;

    // Editar
    card.querySelector(".editar").addEventListener("click", () => {
      editandoCategoriaId = cat.id;
      document.getElementById("nombreCategoria").value = cat.nombre;
      modalCategoria.style.display = "block";
    });

    // Eliminar
    card.querySelector(".eliminar").addEventListener("click", async () => {
      if (confirm("¿Eliminar esta categoría?")) {
        await eliminarCategoria(cat.id);
        await mostrarCategorias();
      }
    });

    listaCategorias.appendChild(card);
  });
}

// 👉 Filtro de búsqueda
function filtrarCategorias(texto) {
  const filtradas = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(texto.toLowerCase())
  );
  renderizarCategorias(filtradas);
}

// 👉 Detectar búsqueda en vivo
inputBuscarCategoria.addEventListener("input", (e) => {
  filtrarCategorias(e.target.value);
});

document.addEventListener("DOMContentLoaded", mostrarCategorias);
