
let caja = [
    { valor: 500, cantidad: 0 },
    { valor: 200, cantidad: 0 },
    { valor: 100, cantidad: 0 },
    { valor: 50, cantidad: 1 },
    { valor: 20, cantidad: 4 },
    { valor: 10, cantidad: 8 },
    { valor: 5, cantidad: 2 },
    { valor: 2, cantidad: 5 },
    { valor: 1, cantidad: 4 },
    { valor: 0.5, cantidad: 0 },
    { valor: 0.2, cantidad: 0 },
    { valor: 0.1, cantidad: 1 },
    { valor: 0.05, cantidad: 2 },
    { valor: 0.02, cantidad: 3 },
    { valor: 0.01, cantidad: 1 }
];

function eurosACentimos(euros) {
    return Math.round(euros * 100);
}

function formatoEuros(centimos) {
    return (centimos / 100).toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR"
    });
}

function calcularDineroCaja(caja) {
    let total = 0;

    for (let i = 0; i < caja.length; i++) {
        total += eurosACentimos(caja[i].valor) * caja[i].cantidad;
    }

    return total;
}
console.log(calcularDineroCaja(caja));

function mostrarCaja() {
    let billetes = document.querySelector("#billetes");
    let monedas = document.querySelector("#monedas");
    let total = document.querySelector("#total");

    billetes.innerHTML = "";
    monedas.innerHTML = "";

    for (let i = 0; i < caja.length; i++) {
        let elemento = document.createElement("article");

        elemento.classList.add(
            caja[i].valor >= 5 ? "billete" : "moneda"
        );

        elemento.innerHTML = `
            <div class="valor">${caja[i].valor} €</div>
            <div class="cantidad">
                Cantidad: ${caja[i].cantidad}
            </div>
        `;

        if (caja[i].valor >= 5) {
            billetes.appendChild(elemento);
        } else {
            monedas.appendChild(elemento);
        }
    }

    total.innerText = formatoEuros(calcularDineroCaja(caja));
}

function calcularCambio(cajaTemporal, cambio) {
    let pendiente = cambio;
    let devolucion = [];

    for (let i = 0; i < cajaTemporal.length; i++) {
        let valorCentimos = eurosACentimos(cajaTemporal[i].valor);

        let cantidadNecesaria = Math.floor(
            pendiente / valorCentimos
        );

        let cantidadDevolver = Math.min(
            cantidadNecesaria,
            cajaTemporal[i].cantidad
        );

        devolucion.push(cantidadDevolver);

        pendiente -= cantidadDevolver * valorCentimos;
    }

    if (pendiente !== 0) {
        return null;
    }

    return devolucion;
}

function procesarCompra() {
    let precioInput = document.querySelector("#precio");
    let denominacionInput = document.querySelector("#denominacion");
    let cantidadInput = document.querySelector("#cantidadPago");
    let resultado = document.querySelector("#resultado");

    let precio = Number(precioInput.value);
    let denominacion = Number(denominacionInput.value);
    let cantidadPago = Number(cantidadInput.value);

    if (
        precioInput.value.trim() === "" ||
        !Number.isFinite(precio) ||
        precio <= 0 ||
        !Number.isInteger(cantidadPago) ||
        cantidadPago < 1
    ) {
        resultado.innerText = "Introduce un precio válido y una cantidad entera mayor que cero.";
        return;
    }

    let dineroPagado = eurosACentimos(denominacion) * cantidadPago;
    let precioCentimos = eurosACentimos(precio);

    if (dineroPagado < precioCentimos) {
        resultado.innerText = `Te falta ${formatoEuros(precioCentimos - dineroPagado)}.`;
        return;
    }

    let cambio = dineroPagado - precioCentimos;

    // Trabajamos con una copia para no alterar la caja
    // hasta comprobar que podemos devolver todo el cambio.
    let cajaTemporal = caja.map(elemento => ({
        valor: elemento.valor,
        cantidad: elemento.cantidad
    }));

    // Añadimos el pago recibido a la copia.
    let indicePago = cajaTemporal.findIndex(
        elemento => eurosACentimos(elemento.valor) === eurosACentimos(denominacion)
    );

    if (indicePago === -1) {
        resultado.innerText = "No se reconoce la denominación del pago.";
        return;
    }

    cajaTemporal[indicePago].cantidad += cantidadPago;

    // Buscamos una devolución exacta.
    let devolucion = calcularCambio(cajaTemporal, cambio);

    if (devolucion === null) {
        resultado.innerText = "No hay una combinación de billetes y monedas para devolver el cambio exacto. La caja no se ha modificado.";
        return;
    }

    // Aplicamos el cambio a la copia.
    for (let i = 0; i < cajaTemporal.length; i++) {
        cajaTemporal[i].cantidad -= devolucion[i];
    }

    // Confirmamos la operación en la caja real.
    for (let i = 0; i < caja.length; i++) {
        caja[i].cantidad = cajaTemporal[i].cantidad;
    }

    if (cambio === 0) {
        resultado.innerText = "¡Gracias por la compra! Has pagado el importe exacto.";
    } else {
        let detalle = [];

        for (let i = 0; i < devolucion.length; i++) {
            if (devolucion[i] > 0) {
                detalle.push(
                    `${devolucion[i]} × ${caja[i].valor} €`
                );
            }
        }

        resultado.innerHTML = `
            <strong>¡Compra realizada!</strong><br>
            Precio: ${formatoEuros(precioCentimos)}<br>
            Pagado: ${formatoEuros(dineroPagado)}<br>
            Cambio: ${formatoEuros(cambio)}<br>
            <strong>Entregar:</strong><br>
            ${detalle.join("<br>")}
        `;
    }

    mostrarCaja();
}

document.querySelector("#procesar").addEventListener("click", procesarCompra);

mostrarCaja(); 