import { getDb } from '../db.js';
import { Submission } from '../domain/Submission.js';

export class SubmissionRepository {
  save(submission) {
    const stmt = getDb().prepare(
      'INSERT INTO submissions (id, attempt_id, content, format, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(submission.id, submission.attemptId, JSON.stringify(submission.content), submission.format, submission.status, submission.submittedAt);
  }

  update(submission) {
    const stmt = getDb().prepare('UPDATE submissions SET status = ? WHERE id = ?');
    stmt.run(submission.status, submission.id);
  }

  findById(id) {
    const row = getDb().prepare('SELECT * FROM submissions WHERE id = ?').get(id);
    if (!row) return null;
    return new Submission({
      id: row.id, attemptId: row.attempt_id, content: JSON.parse(row.content),
      format: row.format, status: row.status, submittedAt: row.submitted_at
    });
  }

  findByAttemptId(attemptId) {
    const rows = getDb().prepare('SELECT * FROM submissions WHERE attempt_id = ?').all(attemptId);
    return rows.map(row => new Submission({
      id: row.id, attemptId: row.attempt_id, content: JSON.parse(row.content),
      format: row.format, status: row.status, submittedAt: row.submitted_at
    }));
  }
}