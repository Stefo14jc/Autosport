require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

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

    const adminPass = await bcrypt.hash("admin123", 10);
    const bodegaPass = await bcrypt.hash("bodega123", 10);

    // Usuario Admin ('admin' en minúscula)
    await pool.query(
      `
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES ('Administrador', 'admin@autosport.com', $1, 'admin')
      ON CONFLICT (email) 
      DO UPDATE SET password = EXCLUDED.password, rol = EXCLUDED.rol;
    `,
      [adminPass],
    );

    // Usuario Bodeguero ('bodeguero' en minúscula)
    await pool.query(
      `
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES ('Bodeguero', 'bodega@autosport.com', $1, 'bodeguero')
      ON CONFLICT (email) 
      DO UPDATE SET password = EXCLUDED.password, rol = EXCLUDED.rol;
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
