import { getDb } from '../db.js';
import { Attempt } from '../domain/Attempt.js';

export class AttemptRepository {
  save(attempt) {
    const stmt = getDb().prepare(
      'INSERT INTO attempts (id, problem_id, learner_id, status, started_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(attempt.id, attempt.problemId, attempt.learnerId, attempt.status, attempt.startedAt, attempt.updatedAt);
  }

  update(attempt) {
    const stmt = getDb().prepare(
      'UPDATE attempts SET status = ?, updated_at = ? WHERE id = ?'
    );
    stmt.run(attempt.status, attempt.updatedAt, attempt.id);
  }

  findById(id) {
    const row = getDb().prepare('SELECT * FROM attempts WHERE id = ?').get(id);
    if (!row) return null;
    return new Attempt({
      id: row.id, problemId: row.problem_id, learnerId: row.learner_id,
      status: row.status, startedAt: row.started_at, updatedAt: row.updated_at
    });
  }

  findByProblemAndLearner(problemId, learnerId) {
    const rows = getDb().prepare('SELECT * FROM attempts WHERE problem_id = ? AND learner_id = ?').all(problemId, learnerId);
    return rows.map(row => new Attempt({
      id: row.id, problemId: row.problem_id, learnerId: row.learner_id,
      status: row.status, startedAt: row.started_at, updatedAt: row.updated_at
    }));
  }
}