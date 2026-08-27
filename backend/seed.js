require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// Conexión a la base de datos de Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost")
      ? { rejectUnauthorized: false }
      : false,
});

async function runSeed() {
  try {
    console.log("Conectando a la base de datos en Railway...");

    // Hash de las contraseñas
    const adminPass = await bcrypt.hash("admin123", 10);
    const bodegaPass = await bcrypt.hash("bodega123", 10);

    // Asegurar que la tabla usuarios exista
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar o actualizar usuario Admin
    await pool.query(
      `
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES ('Administrador', 'admin@autosport.com', $1, 'Admin')
      ON CONFLICT (email) 
      DO UPDATE SET password = EXCLUDED.password;
    `,
      [adminPass],
    );

    // Insertar o actualizar usuario Bodeguero
    await pool.query(
      `
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES ('Bodeguero', 'bodega@autosport.com', $1, 'Bodeguero')
      ON CONFLICT (email) 
      DO UPDATE SET password = EXCLUDED.password;
    `,
      [bodegaPass],
    );

    console.log(
      "✅ ¡Usuarios Admin y Bodeguero creados/actualizados con éxito!",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al poblar la base de datos:", error);
    process.exit(1);
  }
}

runSeed();
