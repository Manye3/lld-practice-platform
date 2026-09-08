import { Evaluator } from './Evaluator.js';
import { Evaluation } from '../domain/Evaluation.js';
import { DeterministicEvaluator } from './DeterministicEvaluator.js';
import { LLMEvaluator } from './LLMEvaluator.js';

export class CompositeEvaluator extends Evaluator {
  constructor() {
    super('composite');
    this.deterministic = new DeterministicEvaluator();
    this.llm = new LLMEvaluator();
  }

  async evaluate(submission, problem) {
    const detEval = await this.deterministic.evaluate(submission, problem);
    
    let llmEval = null;
    try {
      llmEval = await this.llm.evaluate(submission, problem);
    } catch (e) {
      // LLM might be unavailable or throw error before returning Evaluation object
    }

    if (!llmEval || llmEval.status === 'failed') {
      return new Evaluation({
        submissionId: submission.id,
        evaluatorType: this.name,
        overallScore: detEval.overallScore,
        feedback: detEval.feedback,
        strengths: detEval.strengths,
        improvements: detEval.improvements,
        status: 'partial'
      });
    }

    const overallScore = Math.round((detEval.overallScore * 0.4) + (llmEval.overallScore * 0.6));
    
    return new Evaluation({
      submissionId: submission.id,
      evaluatorType: this.name,
      overallScore,
      feedback: [...detEval.feedback, ...llmEval.feedback],
      strengths: [...detEval.strengths, ...llmEval.strengths],
      improvements: [...detEval.improvements, ...llmEval.improvements],
      status: 'completed'
    });
  }
}