import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
// import { handleDemo } from "./routes/demo.js"; // Note: Assuming this was .js or .ts
import { setupDatabase } from "./db/setup.ts"; // FIX 1: Corrected filename and added .js extension
import { createThematicAreasRoutes } from "./routes/thematicAreas.ts"; // FIX 2: Added .js extension
import { createCountiesRoutes } from "./routes/counties.ts"; // FIX 3: Added .js extension
import { createIndicatorsRoutes } from "./routes/indicator.ts"; // FIX 4: Added .js extension
import { createSummaryRoutes } from "./routes/summary.ts" // FIX 5: Added .js extension
import { createPublicationsRoutes } from "./routes/publications.ts";
import authRouter from "./routes/auth.ts"; // FIX 6: Added .js extension

/**
 * Create and return an Express app wired with routes and middleware.
 * This function does NOT call `app.listen` so it can be used as middleware
 * (for example, mounted into Vite's dev server) or started standalone.
 */
export async function createServer() {
  // Ensure the import path is fully specified for module resolution
  const db = await setupDatabase();
  const app = express();

  // Middleware
  app.use(cors());
  // Increase body size limits so base64 file uploads (small-to-medium) are accepted.
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API routes
  app.use('/auth', authRouter); // New authentication routes
  app.use("/thematic-areas", createThematicAreasRoutes(db));
  app.use("/counties", createCountiesRoutes(db));
  // The dynamic import already handles the extension well, but let's ensure consistency if possible.
  // Assuming the publication route is defined in publications.js/ts and exported correctly.
  app.use("/publications", createPublicationsRoutes(db));
  app.use("/indicators", createIndicatorsRoutes(db))


  app.use("/counties/summary-performance", createSummaryRoutes(db))
  // Example API routes
  app.get("/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // app.get("/demo", handleDemo);

  // In production the built SPA can be served from the `spa` folder.
  if (process.env.NODE_ENV === "production") {
    const __dirname = import.meta.dirname;
    const distPath = path.join(__dirname, "../spa");

    app.use(express.static(distPath));

    app.get(/^(?!\/api\/).*$/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

/**
 * Start the server (listen on a port). Useful for starting the production server.
 */
export async function startServer() {
  try {
    const app = await createServer();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
