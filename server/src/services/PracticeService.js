import { ProblemRepository } from '../repository/ProblemRepository.js';
import { AttemptRepository } from '../repository/AttemptRepository.js';
import { SubmissionRepository } from '../repository/SubmissionRepository.js';
import { EvaluationRepository } from '../repository/EvaluationRepository.js';
import { Attempt } from '../domain/Attempt.js';

export class PracticeService {
  constructor() {
    this.problemRepo = new ProblemRepository();
    this.attemptRepo = new AttemptRepository();
    this.submissionRepo = new SubmissionRepository();
    this.evalRepo = new EvaluationRepository();
  }

  getProblems() {
    return this.problemRepo.findAll();
  }

  getProblem(id) {
    return this.problemRepo.findById(id);
  }

  startAttempt(problemId, learnerId) {
    const attempt = new Attempt({ problemId, learnerId });
    this.attemptRepo.save(attempt);
    return attempt;
  }

  getAttemptHistory(problemId, learnerId) {
    const attempts = this.attemptRepo.findByProblemAndLearner(problemId, learnerId);
    return attempts.map(attempt => {
      const submissions = this.submissionRepo.findByAttemptId(attempt.id);
      return {
        ...attempt,
        submissions: submissions.map(sub => ({
          ...sub,
          evaluation: this.evalRepo.findBySubmissionId(sub.id)
        }))
      };
    });
  }
}