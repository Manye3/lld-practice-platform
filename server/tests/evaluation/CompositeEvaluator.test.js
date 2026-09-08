import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CompositeEvaluator } from '../../src/evaluation/CompositeEvaluator.js';
import { Submission } from '../../src/domain/Submission.js';

describe('CompositeEvaluator', () => {
  it('should produce evaluation with deterministic-only when no API key', async () => {
    // Ensure no API key is set so LLM evaluator is skipped/fails
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const evaluator = new CompositeEvaluator();
    const sub = new Submission({
      attemptId: '1',
      content: {
        classes: [
          { name: 'ParkingLot', responsibilities: ['manage floors'] },
          { name: 'ParkingSpot', responsibilities: ['track vehicle'] }
        ],
        relationships: [{ from: 'ParkingLot', to: 'ParkingSpot', type: 'composition', description: 'has many' }],
        designDecisions: ['Used composition']
      }
    });

    const result = await evaluator.evaluate(sub, { keyEntities: [{ name: 'ParkingLot' }] });
    
    assert.ok(result.overallScore >= 0, 'Should have a score');
    assert.ok(result.feedback.length > 0, 'Should have feedback');
    assert.ok(
      result.status === 'completed' || result.status === 'partial',
      `Status should be completed or partial, got ${result.status}`
    );

    // Restore
    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  });

  it('should have feedback items from deterministic evaluator', async () => {
    delete process.env.GEMINI_API_KEY;

    const evaluator = new CompositeEvaluator();
    const sub = new Submission({
      attemptId: '2',
      content: {
        classes: [{ name: 'Vehicle', responsibilities: ['store type'] }],
        relationships: [],
        designDecisions: []
      }
    });

    const result = await evaluator.evaluate(sub, { 
      keyEntities: [{ name: 'Vehicle' }, { name: 'ParkingLot' }, { name: 'Ticket' }] 
    });

    assert.ok(result.feedback.length > 0, 'Should have deterministic feedback');
    assert.ok(result.overallScore < 80, 'Incomplete submission should score low');
  });
});