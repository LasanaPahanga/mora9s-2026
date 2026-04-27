import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { DB_CONFIG } from "./src/config/env.js";

async function createAdmin() {
  const username = "admin";
  const password = "admin123";

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  console.log("Creating admin user...");
  console.log("Username:", username);
  console.log("Password:", password);
  console.log("Hash:", password_hash);

  try {
    const connection = await mysql.createConnection(DB_CONFIG);

    await connection.execute("DELETE FROM admin_users");

    await connection.execute(
      "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
      [username, password_hash]
    );

    console.log("\n✅ Admin user created successfully!");
    console.log("\nLogin credentials:");
    console.log("Username: admin");
    console.log("Password: admin123");

    await connection.end();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createAdmin();
