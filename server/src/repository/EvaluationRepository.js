import { getDb } from '../db.js';
import { Evaluation } from '../domain/Evaluation.js';

export class EvaluationRepository {
  save(evaluation) {
    const stmt = getDb().prepare(
      'INSERT INTO evaluations (id, submission_id, evaluator_type, overall_score, feedback, strengths, improvements, status, created_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(
      evaluation.id, evaluation.submissionId, evaluation.evaluatorType, evaluation.overallScore,
      JSON.stringify(evaluation.feedback), JSON.stringify(evaluation.strengths),
      JSON.stringify(evaluation.improvements), evaluation.status, evaluation.createdAt,
      JSON.stringify(evaluation.metadata)
    );
  }

  findById(id) {
    const row = getDb().prepare('SELECT * FROM evaluations WHERE id = ?').get(id);
    if (!row) return null;
    return new Evaluation({
      id: row.id, submissionId: row.submission_id, evaluatorType: row.evaluator_type,
      overallScore: row.overall_score, feedback: JSON.parse(row.feedback),
      strengths: JSON.parse(row.strengths), improvements: JSON.parse(row.improvements),
      status: row.status, createdAt: row.created_at, metadata: JSON.parse(row.metadata)
    });
  }

  findBySubmissionId(submissionId) {
    const row = getDb().prepare('SELECT * FROM evaluations WHERE submission_id = ?').get(submissionId);
    if (!row) return null;
    return new Evaluation({
      id: row.id, submissionId: row.submission_id, evaluatorType: row.evaluator_type,
      overallScore: row.overall_score, feedback: JSON.parse(row.feedback),
      strengths: JSON.parse(row.strengths), improvements: JSON.parse(row.improvements),
      status: row.status, createdAt: row.created_at, metadata: JSON.parse(row.metadata)
    });
  }
}