    // === Obtener elementos ===
    const modalCategoria = document.getElementById("modalCategoria");
    const modalProducto = document.getElementById("modalProducto");
    const modalQR = document.getElementById("modalQR");
    const btnCrearCategoria = document.getElementById("btnCrearCategoria");
    const btnCrearProducto = document.getElementById("btnCrearObjeto");
    const closeBtns = document.querySelectorAll(".modal .close");
    const cancelarBtns = document.querySelectorAll(".btn-cancelar");
    const buscarCategoriaInput = document.getElementById("buscarCategoria");
    const searchBtn = document.querySelector(".search-btn");
    const descargarQRBtn = document.getElementById("descargarQR");

    // Datos
    let categorias = [];
    let productos = [];
    let qrActual = null;

    // === Abrir modales ===
    btnCrearCategoria.addEventListener("click", () => {
      modalCategoria.style.display = "block";
    });

    btnCrearProducto.addEventListener("click", () => {
      modalProducto.style.display = "block";
    });

    // === Cerrar modales ===
    closeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        btn.closest(".modal").style.display = "none";
      });
    });

    cancelarBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        btn.closest(".modal").style.display = "none";
      });
    });

    window.addEventListener("click", (event) => {
      if (event.target.classList.contains("modal")) {
        event.target.style.display = "none";
      }
    });

    // === Función de búsqueda de categorías ===
    buscarCategoriaInput.addEventListener("input", buscarCategorias);
    searchBtn.addEventListener("click", buscarCategorias);

    function buscarCategorias() {
      const texto = buscarCategoriaInput.value.toLowerCase();
      const cards = document.querySelectorAll("#listaCategorias .card");
      
      cards.forEach(card => {
        const nombre = card.querySelector("h3").textContent.toLowerCase();
        if (nombre.includes(texto)) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    }

    /* ========= CATEGORÍAS ========= */
    document.getElementById("formCategoria").addEventListener("submit", (e) => {
      e.preventDefault();
      const nombreCategoria = document.getElementById("nombreCategoria").value.trim();
      if (!nombreCategoria) return;

      categorias.push(nombreCategoria);

      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
          <h3>${nombreCategoria}</h3>
          <div class="card-actions">
              <button class="editar"><i class="fas fa-edit"></i></button>
              <button class="eliminar"><i class="fas fa-trash"></i></button>
          </div>
      `;

      // Agregar al inicio de la lista
      const lista = document.getElementById("listaCategorias");
      lista.insertBefore(card, lista.firstChild);

      // Agregar al select de productos
      const option = document.createElement("option");
      option.value = nombreCategoria;
      option.textContent = nombreCategoria;
      document.getElementById("categoriaProducto").appendChild(option);
      document.getElementById("filtrarCategoria").appendChild(option.cloneNode(true));

      modalCategoria.style.display = "none";
      e.target.reset();
    });

    /* ========= OBJETOS ========= */
    document.getElementById("agregarCampoProducto").addEventListener("click", () => {
      const contenedor = document.getElementById("camposProducto");
      const div = document.createElement("div");
      div.classList.add("campo-adicional");

      div.innerHTML = `
        <div class="input-group">
          <input type="text" placeholder="Nombre del campo" class="nombre-campo" required>
        </div>
        <div class="input-group">
          <input type="text" placeholder="Valor del campo" class="valor-campo" required>
        </div>
        <button type="button" class="btn-eliminar-campo" title="Eliminar campo">
            <i class="fas fa-times"></i>
        </button>
      `;

      contenedor.appendChild(div);

      div.querySelector(".btn-eliminar-campo").addEventListener("click", () => {
        div.remove();
      });
    });

    document.getElementById("formProducto").addEventListener("submit", (e) => {
      e.preventDefault();

      const categoria = document.getElementById("categoriaProducto").value;
      const nombre = document.getElementById("nombreProducto").value;
      const codigo = document.getElementById("codigoProducto").value;
      const lugar = document.getElementById("lugarProducto").value;
      const zona = document.getElementById("zonaProducto").value;
      const fotoInput = document.getElementById("fotoProducto");

      if (!categoria || !nombre || !codigo || !lugar || !zona) return;

      // Crear objeto con los datos
      const producto = {
        id: Date.now(), // ID único para el objeto
        categoria,
        nombre,
        codigo,
        lugar,
        zona,
        foto: null,
        camposAdicionales: {}
      };

      // Recoger campos adicionales
      document.querySelectorAll("#camposProducto .campo-adicional").forEach(div => {
        const nombreCampo = div.querySelector(".nombre-campo").value;
        const valorCampo = div.querySelector(".valor-campo").value;
        if (nombreCampo.trim() !== "") {
          producto.camposAdicionales[nombreCampo] = valorCampo;
        }
      });

      // Guardar en array (al inicio para que aparezca primero)
      productos.unshift(producto);

      // Crear tarjeta
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.id = producto.id;

      let html = `
          <h3>${nombre}</h3>
          <p><b>Código:</b> ${codigo}</p>
          <p><b>Lugar:</b> ${lugar}</p>
          <p><b>Zona:</b> ${zona}</p>
          <p><b>Categoría:</b> ${categoria}</p>
      `;

      // Agregar campos personalizados
      for (const [nombreCampo, valorCampo] of Object.entries(producto.camposAdicionales)) {
        html += `<p><b>${nombreCampo}:</b> ${valorCampo}</p>`;
      }

      // Foto del objeto
      if (fotoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
          producto.foto = e.target.result;
          html += `<img src="${producto.foto}" alt="Foto del objeto">`;
          card.innerHTML = html;
          agregarAccionesTarjeta(card, producto);
        };
        reader.readAsDataURL(fotoInput.files[0]);
      } else {
        card.innerHTML = html;
        agregarAccionesTarjeta(card, producto);
      }

      // Agregar al inicio de la lista
      const lista = document.getElementById("listaProductos");
      lista.insertBefore(card, lista.firstChild);

      // Resetear
      modalProducto.style.display = "none";
      e.target.reset();
      document.getElementById("camposProducto").innerHTML = "";
    });

    // Función para agregar botones de acción a la tarjeta
    function agregarAccionesTarjeta(card, producto) {
      const acciones = document.createElement("div");
      acciones.classList.add("card-actions");
      acciones.innerHTML = `
          <button class="generar-qr" title="Generar QR"><i class="fas fa-qrcode"></i></button>
          <button class="editar" title="Editar"><i class="fas fa-edit"></i></button>
          <button class="eliminar" title="Eliminar"><i class="fas fa-trash"></i></button>
      `;
      card.appendChild(acciones);

      // Evento para generar QR
      acciones.querySelector(".generar-qr").addEventListener("click", () => {
        generarQR(producto);
      });

      // Evento para eliminar
      acciones.querySelector(".eliminar").addEventListener("click", () => {
        if (confirm("¿Estás seguro de que quieres eliminar este objeto?")) {
          card.remove();
          productos = productos.filter(p => p.id !== producto.id);
        }
      });
    }

    // Función para generar código QR
    function generarQR(producto) {
      // Crear texto para el QR
      let textoQR = `OBJETO: ${producto.nombre}\n`;
      textoQR += `CÓDIGO: ${producto.codigo}\n`;
      textoQR += `LUGAR: ${producto.lugar}\n`;
      textoQR += `ZONA: ${producto.zona}\n`;
      textoQR += `CATEGORÍA: ${producto.categoria}\n`;
      
      // Agregar campos adicionales
      for (const [nombre, valor] of Object.entries(producto.camposAdicionales)) {
        textoQR += `${nombre.toUpperCase()}: ${valor}\n`;
      }

      // Limpiar contenedor QR
      const qrContainer = document.getElementById("qrcode");
      qrContainer.innerHTML = "";

      // Generar QR
      QRCode.toCanvas(qrContainer, textoQR, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      }, function(err) {
        if (err) console.error(err);
      });

      // Guardar referencia al QR actual
      qrActual = producto;

      // Mostrar modal
      modalQR.style.display = "block";
    }

    // Descargar QR
    descargarQRBtn.addEventListener("click", () => {
      if (!qrActual) return;
      
      const canvas = document.querySelector("#qrcode canvas");
      const enlace = document.createElement("a");
      enlace.download = `QR_${qrActual.nombre}.png`;
      enlace.href = canvas.toDataURL("image/png");
      enlace.click();
    });

    // Funcionalidad de búsqueda para objetos
    document.getElementById("buscarNombre").addEventListener("input", filtrarObjetos);
    document.getElementById("buscarLugar").addEventListener("input", filtrarObjetos);
    document.getElementById("buscarZona").addEventListener("input", filtrarObjetos);
    document.getElementById("filtrarCategoria").addEventListener("change", filtrarObjetos);

    function filtrarObjetos() {
      const nombre = document.getElementById("buscarNombre").value.toLowerCase();
      const lugar = document.getElementById("buscarLugar").value.toLowerCase();
      const zona = document.getElementById("buscarZona").value.toLowerCase();
      const categoria = document.getElementById("filtrarCategoria").value.toLowerCase();
      
      const cards = document.querySelectorAll("#listaProductos .card");
      
      cards.forEach(card => {
        const cardNombre = card.querySelector("h3").textContent.toLowerCase();
        const cardLugar = card.querySelector("p:nth-child(3)").textContent.replace("Lugar: ", "").toLowerCase();
        const cardZona = card.querySelector("p:nth-child(4)").textContent.replace("Zona: ", "").toLowerCase();
        const cardCategoria = card.querySelector("p:nth-child(5)").textContent.replace("Categoría: ", "").toLowerCase();
        
        const coincideNombre = cardNombre.includes(nombre);
        const coincideLugar = cardLugar.includes(lugar);
        const coincideZona = cardZona.includes(zona);
        const coincideCategoria = categoria === "" || cardCategoria.includes(categoria);
        
        if (coincideNombre && coincideLugar && coincideZona && coincideCategoria) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    }