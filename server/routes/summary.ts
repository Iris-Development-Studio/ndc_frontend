// In server.ts or a new file: routes/summary.ts
import { Router } from "express"
import type { Database } from "sqlite"

export function createSummaryRoutes(db: Database) {
    const router = Router()

    // WATER SUMMARY
    router.get("summary-performance/water", async (req, res) => {
        try {
            const rows = await db.all(`
        SELECT 
          c.name,
          COALESCE(cp.sector_score, 0) as score
        FROM counties c
        LEFT JOIN county_performance cp 
          ON c.id = cp.county_id 
          AND cp.year = 2025 
          AND cp.sector = 'water'
        ORDER BY c.name
      `)
            res.json(rows)
        } catch (err) {
            res.status(500).json({ error: "Database error" })
        }
    })

    // WASTE SUMMARY
    router.get("summary-performance/waste", async (req, res) => {
        try {
            const rows = await db.all(`
        SELECT 
          c.name,
          COALESCE(cp.sector_score, 0) as score
        FROM counties c
        LEFT JOIN county_performance cp 
          ON c.id = cp.county_id 
          AND cp.year = 2025 
          AND cp.sector = 'waste'
        ORDER BY c.name
      `)
            res.json(rows)
        } catch (err) {
            res.status(500).json({ error: "Database error" })
        }
    })

    return router
}