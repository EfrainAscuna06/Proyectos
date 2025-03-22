const sqlite3 = require('sqlite3').verbose();

// Conexión a la base de datos SQLite
const db = new sqlite3.Database('./db.sqlite', (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a SQLite');
    }
});

// Crear tablas necesarias si no existen
db.serialize(() => {
    
    // Crear tabla de usuarios
    db.run(`
    CREATE TABLE IF NOT EXISTS Usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    apellido TEXT,
    email TEXT UNIQUE,
    telefono TEXT,
    direccion TEXT,
    provincia TEXT,
    distrito TEXT,
    contrasena TEXT
    );
    `);

    // Crear tabla de pagos
    db.run(`
        CREATE TABLE IF NOT EXISTS Pagos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            tarjeta TEXT NOT NULL,
            nombre_apellido TEXT NOT NULL,
            expiracion TEXT NOT NULL,
            cvv TEXT NOT NULL,
            cuotas INTEGER NOT NULL,
            tipo_documento TEXT NOT NULL,
            numero_documento TEXT NOT NULL,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
        )
    `);
});

// Consultar todos los usuarios
function getAllUsers(callback) {
    db.all("SELECT * FROM Usuarios", (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}

// Consultar un solo usuario por email
function getUserByEmail(email, callback) {
    db.get("SELECT * FROM Usuarios WHERE email = ?", [email], (err, row) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, row);
        }
    });
}

// Insertar un nuevo usuario (sin encriptación de contraseña)
function insertUser(userData, callback) {
    const { nombre, apellido, email, telefono, direccion, provincia, distrito, contrasena } = userData;

    const query = `
        INSERT INTO Usuarios (nombre, apellido, email, telefono, direccion, provincia, distrito, contrasena)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [nombre, apellido, email, telefono, direccion, provincia, distrito, contrasena], function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, this.lastID); // Devuelve el ID del nuevo usuario
        }
    });
}

// Insertar un nuevo pago
function insertPayment(paymentData, callback) {
    const { usuario_id, tarjeta, nombre_apellido, expiracion, cvv, cuotas, tipo_documento, numero_documento } = paymentData;

    const query = `
        INSERT INTO Pagos (usuario_id, tarjeta, nombre_apellido, expiracion, cvv, cuotas, tipo_documento, numero_documento)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [usuario_id, tarjeta, nombre_apellido, expiracion, cvv, cuotas, tipo_documento, numero_documento], function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, this.lastID); // Devuelve el ID del nuevo pago
        }
    });
}


function getUserByEmail(email, callback) {
    const query = `SELECT * FROM Usuarios WHERE email = ?`;
    db.get(query, [email], (err, row) => {
        callback(err, row);
    });
}

// Cerrar la conexión a la base de datos
function closeDB() {
    db.close((err) => {
        if (err) {
            console.error('Error al cerrar la base de datos:', err.message);
        } else {
            console.log('Base de datos cerrada');
        }
    });
}

// Exportar las funciones
module.exports = {
    getAllUsers,
    getUserByEmail,
    insertUser,
    insertPayment,
    closeDB
};