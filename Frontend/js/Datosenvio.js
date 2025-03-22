// Validación de formulario y mensaje de confirmación con SweetAlert2
document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault(); // Evitar el envío del formulario por defecto

    const email = document.getElementById('email').value;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validación del correo electrónico
    if (!regexEmail.test(email)) {
        Swal.fire({
            icon: 'error',
            title: 'Correo inválido',
            text: 'Por favor, ingrese un correo electrónico válido.',
            iconColor: '#e74c3c',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    // Mensaje de confirmación personalizado si todo es válido
    Swal.fire({
        icon: 'success',
        title: '¡Registro de datos exitoso!',
        text: 'Proceda con el pago.',
        iconColor: '#4CAF50', // Cambia el color del icono a verde
        confirmButtonColor: '#3085d6', // Color del botón de confirmación
        confirmButtonText: 'Aceptar', // Texto del botón
        background: '#f9f9f9', // Fondo de la ventana modal
        customClass: {
            title: 'swal2-title-custom', // Clase para el título
            popup: 'swal2-popup-custom' // Clase para el popup
        }
    }).then(() => {
        e.target.submit(); // Enviar el formulario si todo es válido
    });
});
