function processPayment() {
    // Obtener valores de los campos
    const name = document.getElementById("name").value;
    const cardNumber = document.getElementById("cardNumber").value;
    const expiry = document.getElementById("expiry").value;
    const cvv = document.getElementById("cvv").value;
    const amount = document.getElementById("amount").value;
    const messageDiv = document.getElementById("paymentMessage");

    // Validaciones básicas
    if (!name || !cardNumber || !expiry || !cvv || !amount) {
        messageDiv.style.color = "red";
        messageDiv.innerText = "Por favor, completa todos los campos.";
        return;
    }

    if (cardNumber.length !== 16 || isNaN(cardNumber)) {
        messageDiv.style.color = "red";
        messageDiv.innerText = "Número de tarjeta no válido.";
        return;
    }

    if (cvv.length !== 3 || isNaN(cvv)) {
        messageDiv.style.color = "red";
        messageDiv.innerText = "CVV no válido.";
        return;
    }

    // Simulación de procesamiento de pago
    messageDiv.style.color = "green";
    messageDiv.innerText = "Procesando el pago...";

    setTimeout(() => {
        messageDiv.innerText = "Pago realizado con éxito.";
    }, 2000);
}
