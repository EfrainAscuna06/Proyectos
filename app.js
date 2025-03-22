const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const path = require('path');
const session = require('express-session');


const app = express();
const PORT = 3000;


// Middleware para leer datos enviados desde formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'clave_secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Servir archivos estáticos (CSS, imágenes, JS, etc.) desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rutas para servir archivos estáticos (páginas HTML)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Pagina de inicio.html'));
});

app.get('/quienes-somos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Quienessomos.html'));
});

app.get('/notificaciones', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Notificaciones.html'));
});

app.get('/subasta', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Subastas.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Registro.html'));
});

app.get('/proceso-de-pago', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Procesodepago.html'));
});

app.get('/detalle-de-producto', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Detalledeproducto.html'));
});

app.get('/carrito-de-compras', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Carritodecompras.html'));
});

// Registro de usuarios
app.post('/registrar-usuario', (req, res) => {
    const {
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        provincia,
        distrito,
        contrasena
    } = req.body;

    try {
        // Comprobar si el correo electrónico ya existe
        db.getUserByEmail(email, (err, row) => {
            if (err) {
                console.error('Error al verificar el email:', err.message);
                return res.status(500).send('Error en el servidor');
            }
            if (row) {
                return res.status(400).send('El email ya está registrado');
            }

            // Si no existe, se procede con el registro
            db.insertUser({ nombre, apellido, email, telefono, direccion, provincia, distrito, contrasena }, (err, userId) => {
                if (err) {
                    console.error('Error al registrar:', err.message);
                    return res.status(400).send('Error al registrar. El email ya existe.');
                }
                res.send('<h1>Usuario registrado exitosamente</h1><a href="/login">Ir al login</a>');
            });
        });
    } catch (err) {
        console.error('Error en el servidor:', err);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para iniciar sesión
app.post('/iniciar-sesion', (req, res) => {
    const { email, contrasena } = req.body;

    // Buscar al usuario por su email
    db.getUserByEmail(email, (err, user) => {
        if (err) {
            console.error('Error al buscar el usuario:', err.message);
            return res.status(500).send('Error en el servidor');
        }

        if (!user) {
            return res.status(400).send('El correo electrónico no está registrado');
        }

        // Comparar la contraseña directamente (sin encriptación por ahora)
        if (user.contrasena !== contrasena) {
            return res.status(400).send('Contraseña incorrecta');
        }

        // Guardar información del usuario en la sesión
        req.session.usuario_id = user.id;
        req.session.nombre = user.nombre;

        // Redirigir a la página de inicio
        res.redirect('/');
    });
});

// Ruta para la página de inicio
app.get('/', (req, res) => {
    if (!req.session.usuario_id) {
        return res.redirect('/login');  // Si no está autenticado, redirigir al login
    }

    // Enviar el nombre del usuario para que aparezca el mensaje de bienvenida
    const nombreUsuario = req.session.nombre;

    // Crear la respuesta HTML y mostrar el mensaje de bienvenida en la parte superior
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Página de Inicio</title>
            <style>
                .welcome-message {
                    background-color: #4CAF50;
                    color: white;
                    padding: 10px;
                    text-align: center;
                    font-size: 1.2em;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <!-- Mostrar el mensaje de bienvenida -->
            <div class="welcome-message">
                Bienvenido, ${nombreUsuario}!
            </div>

            <h1>Página de Inicio</h1>
            <p>Bienvenido al sitio web. Aquí podrás ver todos nuestros productos y más.</p>

            <a href="/logout">Cerrar sesión</a>

        </body>
        </html>
    `);
});
// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error al cerrar sesión');
        }

        // Redirigir al login después de cerrar sesión
        res.redirect('/login');
    });
});


// Ruta para procesar el pago
app.post('/procesar-pago', (req, res) => {
    const { tarjeta, nombre_apellido, expiracion, cvv, cuotas, tipo_documento, numero_documento } = req.body;

    // Obtener el usuario_id desde la sesión
    const usuario_id = req.session.usuario_id;  // Asegúrate de que este valor esté en la sesión

    if (!usuario_id) {
        return res.status(400).send('No se ha encontrado un usuario autenticado');
    }

    // Crear el objeto con los datos del pago
    const paymentData = {
        usuario_id,
        tarjeta,
        nombre_apellido,
        expiracion,
        cvv,
        cuotas,
        tipo_documento,
        numero_documento
    };

    // Llamar a la función que inserta el pago en la base de datos
    db.insertPayment(paymentData, (err, lastID) => {
        if (err) {
            console.error('Error al procesar el pago:', err.message);
            return res.status(400).send('Error al procesar el pago');
        }

        // Mostrar un mensaje de éxito
        res.send('<h1>Pago realizado con éxito. ¡Gracias por tu compra!</h1><a href="/">Ir al inicio</a>');
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log('Servidor corriendo en http://localhost:${PORT}');
});