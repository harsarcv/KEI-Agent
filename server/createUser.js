require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("./config/database");

const createUser = async () => {
  try {
    const name = "KEI Admin";
    const email = "admin@kei.local";
    const password = "admin123";
    const role = "admin";

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO users
        (name, email, password_hash, role)
      VALUES
        ($1, $2, $3, $4)
      RETURNING id, name, email, role;
      `,
      [name, email, passwordHash, role]
    );

    console.log("User created:");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("Create User Error:", error.message);
  } finally {
    await pool.end();
  }
};

createUser();