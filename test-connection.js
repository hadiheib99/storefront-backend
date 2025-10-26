const { Pool } = require("pg");

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  database: "store_dev",
  user: "store_user",
  password: "store_pass",
});

pool.query("SELECT current_user, current_database()", (err, res) => {
  if (err) {
    console.error("Connection error:", err.message);
    console.error("Full error:", err);
  } else {
    console.log("Connection successful!");
    console.log("Result:", res.rows);
  }
  pool.end();
});
