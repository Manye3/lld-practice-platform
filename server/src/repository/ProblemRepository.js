import { getDb } from '../db.js';
import { Problem } from '../domain/Problem.js';

export class ProblemRepository {
  findAll() {
    const rows = getDb().prepare('SELECT data FROM problems').all();
    return rows.map(r => new Problem(JSON.parse(r.data)));
  }

  findById(id) {
    const row = getDb().prepare('SELECT data FROM problems WHERE id = ?').get(id);
    if (!row) return null;
    return new Problem(JSON.parse(row.data));
  }

  save(problem) {
    const stmt = getDb().prepare('INSERT OR REPLACE INTO problems (id, data) VALUES (?, ?)');
    stmt.run(problem.id, JSON.stringify(problem));
  }

  count() {
    return getDb().prepare('SELECT COUNT(*) as count FROM problems').get().count;
  }
}