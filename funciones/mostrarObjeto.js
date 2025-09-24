function generarQR(obj) {
    qrContainer.innerHTML = "";
    infoQR.innerHTML = `
        <p><b>Nombre:</b> ${obj.nombre}</p>
        <p><b>Código:</b> ${obj.codigo}</p>
        <p><b>Categoría:</b> ${obj.categoriaNombre}</p>
        <p><b>Lugar:</b> ${obj.lugar}</p>
        <p><b>Zona:</b> ${obj.zona}</p>
        ${obj.camposExtra?.map(c => `<p>${c.nombre}: ${c.valor}</p>`).join("")}
        ${obj.foto ? `<img src="${obj.foto}" style="max-width:150px;">` : ""}
    `;
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
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `${obj.nombre}_QR.png`;
        a.click();
    };
}
