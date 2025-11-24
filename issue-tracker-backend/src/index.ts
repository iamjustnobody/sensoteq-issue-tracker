import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
// import dotenv from "dotenv";
import "dotenv/config";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { runMigrations } from "./db/runMigrations.js";

// Load environment variables
// dotenv.config();

// Initialize express app
const app: Application = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging (simple version)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Mount all routes under /api
app.use("/api", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Issue Tracker API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      issues: "/api/issues",
      analytics: "/api/issues/analytics",
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

async function main() {
  console.log("🔄 Running migrations (only missing ones)...");

  try {
    await runMigrations(); // <--- Ensures idempotent migrations
    console.log("✅ Migrations complete.");
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1); // fail fast in production
  }

  app.listen(PORT, () => {
    console.log("=========================================");
    console.log(`🚀 Issue Tracker API`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
    console.log("=========================================");
  });
}

main().catch((err) => {
  console.error("❌ Fatal startup error:", err);
  process.exit(1);
});

export default app;
