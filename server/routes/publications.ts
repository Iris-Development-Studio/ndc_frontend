// routes/publications.ts — FINAL FIXED VERSION
import { Request, Response, Router } from 'express';
import Database from 'better-sqlite3';

export function createPublicationsRoutes(db: Database): Router {
  const router = Router();

  // 1. List all publications
  router.get('/', (_req: Request, res: Response) => {
    try {
      const rows = db.prepare(`
        SELECT id, title, date, summary, filename 
        FROM publications 
        ORDER BY date DESC
      `).all();
      res.json(rows);
    } catch (error: any) {
      console.error("Publications list error:", error);
      res.status(500).json({ error: 'Failed to fetch publications' });
    }
  });

  // 2. Get single publication metadata
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const pub = db.prepare(`
        SELECT id, title, date, summary, filename 
        FROM publications WHERE id = ?
      `).get(req.params.id); // ← .get() not .all()

      if (!pub) return res.status(404).json({ error: 'Publication not found' });
      res.json(pub);
    } catch (error: any) {
      console.error("Get publication error:", error);
      res.status(500).json({ error: 'Failed to fetch publication' });
    }
  });

  // 3. Download file
  router.get('/:id/download', (req: Request, res: Response) => {
    try {
      const row: any = db.prepare('SELECT filename, file_blob FROM publications WHERE id = ?')
        .get(req.params.id); // ← .get() not .all()

      if (!row || !row.file_blob) {
        return res.status(404).json({ error: 'File not found' });
      }

      const ext = (row.filename || '').split('.').pop()?.toLowerCase() || '';
      const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        txt: 'text/plain',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
      };

      res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${row.filename}"`);
      res.send(row.file_blob);
    } catch (error: any) {
      console.error("Download error:", error);
      res.status(500).json({ error: 'Download failed' });
    }
  });

  // 4. Upload new publication
  router.post('/', (req: Request, res: Response) => {
    try {
      const { title, date, summary, filename, contentBase64 } = req.body;
      if (!title || !filename || !contentBase64) {
        return res.status(400).json({ error: 'title, filename and contentBase64 are required' });
      }

      const buffer = Buffer.from(contentBase64, 'base64');
      const stmt = db.prepare(`
        INSERT INTO publications (title, date, summary, filename, file_blob)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = stmt.run(title, date || null, summary || null, filename, buffer);

      res.status(201).json({ id: result.lastInsertRowid, title, filename });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: 'Failed to upload publication' });
    }
  });

  // 5. Delete publication
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const result = db.prepare('DELETE FROM publications WHERE id = ?').run(req.params.id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Publication not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error("Delete error:", error);
      res.status(500).json({ error: 'Failed to delete' });
    }
  });

  return router;
}
