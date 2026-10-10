const pool = require("./database");

const testConnection = async () => {
  try {
    const result = await pool.query("SELECT current_database()");

    console.log(
      `Connected to PostgreSQL database: ${result.rows[0].current_database}`
    );
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
  } finally {
    await pool.end();
  }
};

testConnection();