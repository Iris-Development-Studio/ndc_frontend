import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { setupDatabase } from "./db/setup";
import { createThematicAreasRoutes } from "./routes/thematicAreas";
import { createCountiesRoutes } from "./routes/counties";
import { createIndicatorsRoutes } from "./routes/indicator";
import { createSummaryRoutes } from "./routes/summary"
import authRouter from "./routes/auth";

/**
 * Create and return an Express app wired with routes and middleware.
 * This function does NOT call `app.listen` so it can be used as middleware
 * (for example, mounted into Vite's dev server) or started standalone.
 */
export async function createServer() {
  const db = await setupDatabase();
  const app = express();

  // Middleware
  app.use(cors());
  // Increase body size limits so base64 file uploads (small-to-medium) are accepted.
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API routes
  app.use('/api/auth', authRouter); // New authentication routes
  app.use("/api/thematic-areas", createThematicAreasRoutes(db));
  app.use("/api/counties", createCountiesRoutes(db));
  app.use("/api/publications", (await import("./routes/publications")).createPublicationsRoutes(db));
  app.use("/api/indicators", createIndicatorsRoutes(db))


  app.use("/api/counties", createSummaryRoutes(db))
  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

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
