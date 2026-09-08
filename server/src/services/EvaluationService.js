import { SubmissionRepository } from '../repository/SubmissionRepository.js';
import { EvaluationRepository } from '../repository/EvaluationRepository.js';
import { AttemptRepository } from '../repository/AttemptRepository.js';
import { ProblemRepository } from '../repository/ProblemRepository.js';
import { Submission } from '../domain/Submission.js';
import { CompositeEvaluator } from '../evaluation/CompositeEvaluator.js';

export class EvaluationService {
  constructor() {
    this.submissionRepo = new SubmissionRepository();
    this.evalRepo = new EvaluationRepository();
    this.attemptRepo = new AttemptRepository();
    this.problemRepo = new ProblemRepository();
    this.evaluator = new CompositeEvaluator();
  }

  async submitSolution(attemptId, content, format) {
    const attempt = this.attemptRepo.findById(attemptId);
    if (!attempt) throw new Error('Attempt not found');

    const submission = new Submission({ attemptId, content, format });
    this.submissionRepo.save(submission);

    attempt.markSubmitted();
    this.attemptRepo.update(attempt);

    submission.markEvaluating();
    this.submissionRepo.update(submission);

    const problem = this.problemRepo.findById(attempt.problemId);
    
    try {
      const evaluation = await this.evaluator.evaluate(submission, problem);
      this.evalRepo.save(evaluation);

      submission.markEvaluated();
      this.submissionRepo.update(submission);

      attempt.markEvaluated();
      this.attemptRepo.update(attempt);

      return { submission, evaluation };
    } catch (err) {
      submission.markFailed();
      this.submissionRepo.update(submission);
      throw err;
    }
  }

  getSubmissionWithEvaluation(submissionId) {
    const submission = this.submissionRepo.findById(submissionId);
    if (!submission) return null;
    const evaluation = this.evalRepo.findBySubmissionId(submissionId);
    return { submission, evaluation };
  }
}