import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DeterministicEvaluator } from '../../src/evaluation/DeterministicEvaluator.js';
import { Submission } from '../../src/domain/Submission.js';

describe('DeterministicEvaluator', () => {
  const evaluator = new DeterministicEvaluator();
  const mockProblem = {
    keyEntities: [{ name: 'ClassA' }, { name: 'ClassB' }]
  };

  it('should give high score for good submission', async () => {
    const sub = new Submission({
      attemptId: '123',
      content: {
        classes: [
          { name: 'ClassA', responsibilities: ['R1', 'R2'] },
          { name: 'ClassB', responsibilities: ['R3'] }
        ],
        relationships: [{ from: 'ClassA', to: 'ClassB', type: 'association', description: 'uses' }],
        designDecisions: ['Used composition over inheritance for flexibility']
      }
    });

    const result = await evaluator.evaluate(sub, mockProblem);
    assert.ok(result.overallScore > 50, `Expected score > 50, got ${result.overallScore}`);
    assert.ok(result.feedback.length > 0, 'Should have feedback items');
  });

  it('should give low score for empty submission', async () => {
    const sub = new Submission({
      attemptId: '123',
      content: {
        classes: [{ name: 'RandomClass', responsibilities: [] }],
        relationships: [],
        designDecisions: []
      }
    });

    const result = await evaluator.evaluate(sub, mockProblem);
    assert.ok(result.overallScore < 50, `Expected score < 50, got ${result.overallScore}`);
  });

  it('should flag SRP violations for overloaded classes', async () => {
    const sub = new Submission({
      attemptId: '123',
      content: {
        classes: [
          { name: 'ClassA', responsibilities: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'] },
          { name: 'ClassB', responsibilities: ['R8'] }
        ],
        relationships: [{ from: 'ClassA', to: 'ClassB', type: 'association', description: 'uses' }]
      }
    });

    const result = await evaluator.evaluate(sub, mockProblem);
    const hasSRPWarning = result.feedback.some(f => 
      f.category === 'solid_principles' || f.category === 'responsibility_assignment'
    );
    assert.ok(hasSRPWarning, 'Should flag SRP violation');
  });

  it('should give partial entity coverage score', async () => {
    const sub = new Submission({
      attemptId: '123',
      content: {
        classes: [
          { name: 'ClassA', responsibilities: ['R1'] }
          // Missing ClassB
        ],
        relationships: []
      }
    });

    const result = await evaluator.evaluate(sub, mockProblem);
    const coverageFeedback = result.feedback.find(f => f.category === 'entity_coverage');
    assert.ok(coverageFeedback, 'Should have entity coverage feedback');
  });
});