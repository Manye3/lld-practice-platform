import { Evaluator } from './Evaluator.js';
import { Evaluation } from '../domain/Evaluation.js';

export class LLMEvaluator extends Evaluator {
  constructor() {
    super('llm');
  }

  async evaluate(submission, problem) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const prompt = `
      Evaluate this LLD (Low-Level Design) submission for the problem: "${problem.title}".
      Requirements: ${problem.requirements.join(', ')}
      Context: ${problem.context}

      Learner's Submission:
      ${JSON.stringify(submission.content, null, 2)}

      Evaluate on abstraction quality, SOLID adherence, design patterns, extensibility, naming, and edge cases.
      Return a JSON object with this exact structure:
      {
        "overallScore": 85,
        "strengths": ["string"],
        "improvements": ["string"],
        "feedbackItems": [
          { "category": "solid_principles", "severity": "warning", "message": "...", "details": "...", "relatedEntity": "ClassName" }
        ]
      }
    `;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: 'application/json' }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Failed to fetch from LLM');

      const data = await response.json();
      const llmResult = JSON.parse(data.candidates[0].content.parts[0].text);

      return new Evaluation({
        submissionId: submission.id,
        evaluatorType: this.name,
        overallScore: llmResult.overallScore,
        feedback: llmResult.feedbackItems || [],
        strengths: llmResult.strengths || [],
        improvements: llmResult.improvements || [],
        status: 'completed'
      });
    } catch (error) {
      return new Evaluation({
        submissionId: submission.id,
        evaluatorType: this.name,
        overallScore: 0,
        feedback: [{ category: 'general', severity: 'critical', message: 'AI evaluation failed', details: error.message }],
        status: 'failed'
      });
    }
  }
}