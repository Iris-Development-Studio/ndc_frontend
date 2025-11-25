
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function setupDatabase() {
  const db = await open({
    filename: './ndc.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS thematic_areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS counties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      population INTEGER,
      thematic_area_id INTEGER,
      FOREIGN KEY (thematic_area_id) REFERENCES thematic_areas (id)
    );

    CREATE TABLE IF NOT EXISTS publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT,
      summary TEXT,
      filename TEXT,
      file_blob BLOB
    );

    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        organisation TEXT,
        phoneNumber TEXT,
        position TEXT,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS county_performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      county_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      sector TEXT NOT NULL CHECK(sector IN ('water', 'waste')),
      overall_score REAL,
      sector_score REAL,
      governance REAL,
      mrv REAL,
      mitigation REAL,
      adaptation REAL,
      finance REAL,
      indicators_json TEXT, 
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP, 
      FOREIGN KEY (county_id) REFERENCES counties (id),
      UNIQUE(county_id, year, sector)
    );

    CREATE TABLE IF NOT EXISTS indicators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector TEXT NOT NULL CHECK(sector IN ('water', 'waste')),
    thematic_area TEXT NOT NULL,
    indicator_text TEXT NOT NULL,
    weight REAL NOT NULL DEFAULT 10,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sector, indicator_text)
  );

  INSERT OR IGNORE INTO indicators (sector, thematic_area, indicator_text, weight) VALUES
    ('water', 'Governance & Institutional Arrangements', 'Climate change coordination unit established', 10),
    ('water', 'Governance & Institutional Arrangements', 'County climate change act enacted', 10),
    ('water', 'MRV (Monitoring, Reporting & Verification)', 'Water sector GHG inventory completed', 10),
    ('water', 'Mitigation', 'Water efficiency programs implemented', 10),
    ('water', 'Adaptation & Resilience', 'Drought early warning system operational', 10),
    ('water', 'Finance & Resource Mobilization', 'Climate budget tagging system in place', 10),

    ('waste', 'Governance & Institutional Arrangements', 'County waste management policy adopted', 10),
    ('waste', 'Governance & Institutional Arrangements', 'Waste collection by-laws enforced', 10),
    ('waste', 'MRV (Monitoring, Reporting & Verification)', 'Waste sector GHG emissions tracked', 10),
    ('waste', 'Mitigation', 'Landfill gas capture project active', 10),
    ('waste', 'Mitigation', 'Circular economy initiatives launched', 10),
    ('waste', 'Finance & Resource Mobilization', 'Waste revenue used for climate projects', 10);
  `);

  return db;
}
