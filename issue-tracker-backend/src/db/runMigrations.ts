import fs from "fs";
import path from "path";
import pool from "../config/database.js";

const { readdirSync, readFileSync } = fs;
const { join, dirname } = path;
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runMigrations() {
  console.log("\n🔄 Running migrations...");

  try {
    // -------------------------------------------------------
    // 1. Load migration files
    // -------------------------------------------------------
    const migrationsDir = join(__dirname, "../db/migrations");
    const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));

    for (const file of files) {
      const filePath = join(migrationsDir, file);
      const sql = readFileSync(filePath, "utf-8");

      console.log(`\n📄 Applying migration: ${file}`);
      await pool.query(sql);
      console.log(`✔️ Migration applied: ${file}`);
    }

    // -------------------------------------------------------
    // 2. Verify table exists
    // -------------------------------------------------------
    const tableCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
        AND table_name = 'issues'
    `);

    if (tableCheck.rows.length > 0) {
      console.log("✅ Verified: issues table exists");
    } else {
      console.log("⚠️ WARNING: issues table NOT found");
    }

    // -------------------------------------------------------
    // 3. Optional seed
    // -------------------------------------------------------
    const seedPath = join(__dirname, "../db/seed.sql");
    try {
      const seedSQL = readFileSync(seedPath, "utf-8");
      await pool.query(seedSQL);
      console.log("🌱 Seed data inserted");
    } catch {
      console.log("ℹ️ No seed.sql found — skipping seeding");
    }

    // -------------------------------------------------------
    // 4. Show row count
    // -------------------------------------------------------
    const count = await pool.query("SELECT COUNT(*) FROM issues");
    console.log(`📊 Total issues in DB: ${count.rows[0].count}`);

    console.log("\n🎉 All migrations completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    throw err;
  }
}
