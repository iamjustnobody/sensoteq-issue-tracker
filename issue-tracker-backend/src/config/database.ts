import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const isProdDatabase =
  !!process.env.DATABASE_URL || process.env.NODE_ENV === "production";

const pool = isProdDatabase
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "issue_tracker",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
    });

// Test connection on startup
pool.on("connect", () => {
  const connType = isProdDatabase
    ? "Production (DATABASE_URL)"
    : "Local Docker";
  console.log(`📦 Connected to ${connType} PostgreSQL database`);
});

pool.on("error", (err) => {
  console.error("💥 Unexpected error on database connection:", err);
  process.exit(-1);
});

const shutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");
  try {
    await pool.end();
    console.log("✅ Database connections closed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default pool;
