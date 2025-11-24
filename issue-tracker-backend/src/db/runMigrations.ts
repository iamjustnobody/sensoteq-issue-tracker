import fs, { existsSync } from "fs";
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
    // 1. Determine migrations directory
    // -------------------------------------------------------
    const possibleDirs = [
      // join(process.cwd(), "db/migrations"),
      // join(process.cwd(), "../db/migrations"),

      join(__dirname, "db/migrations"),
      join(__dirname, "../src/db/migrations"),
      join(__dirname, "../db/migrations"),
    ];

    const migrationsDir = possibleDirs.find(existsSync);
    if (!migrationsDir) throw new Error("❌ No migrations directory found!");

    const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));

    // -------------------------------------------------------
    // 2. Check if table exists
    // -------------------------------------------------------
    console.log(`🔍 Checking for existing 'issues' table...`);
    const isProdDatabase =
      !!process.env.DATABASE_URL || process.env.NODE_ENV === "production";

    console.log(
      `🔧 Database configuration: ${
        isProdDatabase ? "Production (DATABASE_URL)" : "Local Docker"
      }`
    );

    const tableCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
        AND table_name = 'issues'
    `);

    const tableExists = tableCheck.rows.length > 0;

    if (!tableExists) {
      console.log("⚠️ Table 'issues' does not exist — applying migrations...");

      for (const file of files) {
        const filePath = join(migrationsDir, file);
        const sql = readFileSync(filePath, "utf-8");

        console.log(`\n📄 Applying migration: ${file}`);
        await pool.query(sql);
        console.log(`✔️ Migration applied: ${file}`);
      }
    } else {
      console.log("✅ Table 'issues' already exists — skipping migrations");
    }

    // -------------------------------------------------------
    // 3. Optional seed
    // -------------------------------------------------------
    const possibleSeedFiles = [
      // join(process.cwd(), "db/seed.sql"),
      // join(process.cwd(), "../db/seed.sql"),

      join(__dirname, "db/seed.sql"),
      join(__dirname, "../src/db/seed.sql"),
      join(__dirname, "../db/seed.sql"),
    ];

    const seedPath = possibleSeedFiles.find(existsSync);
    if (seedPath) {
      let insertSeed = false;

      if (!tableExists) {
        insertSeed = true; // table just created, so seed
      } else {
        // table exists, check if empty
        const countResult = await pool.query("SELECT COUNT(*) FROM issues");
        if (parseInt(countResult.rows[0].count, 10) === 0) {
          insertSeed = true;
        }
      }

      if (insertSeed) {
        const seedSQL = readFileSync(seedPath, "utf-8");
        await pool.query(seedSQL);
        console.log("🌱 Seed data inserted");
      } else {
        console.log("ℹ️ Table already has data — skipping seeding");
      }
    } else {
      console.log("ℹ️ No seed.sql found — skipping seeding");
    }

    // -------------------------------------------------------
    // 4. Show row count (if table exists)
    // -------------------------------------------------------
    if (tableExists) {
      const count = await pool.query("SELECT COUNT(*) FROM issues");
      console.log(`📊 Total issues in DB: ${count.rows[0].count}`);
    }

    console.log("\n🎉 Migrations and seeding completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    throw err; // fail fast
  }
}
