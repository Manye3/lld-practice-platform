import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Submission } from '../../src/domain/Submission.js';

describe('Submission', () => {
  it('should create a valid submission', () => {
    const sub = new Submission({
      attemptId: '123',
      content: { classes: [{ name: 'Test' }] }
    });
    assert.equal(sub.status, 'pending');
  });

  it('should fail validation if no classes provided', () => {
    assert.throws(() => {
      new Submission({ attemptId: '123', content: { classes: [] } });
    });
  });

  it('should transition status correctly', () => {
    const sub = new Submission({ attemptId: '123', content: { classes: [{ name: 'Test' }] } });
    sub.markEvaluating();
    assert.equal(sub.status, 'evaluating');
    sub.markEvaluated();
    assert.equal(sub.status, 'evaluated');
  });

  it('should not transition from evaluated back to evaluating', () => {
    const sub = new Submission({ attemptId: '123', content: { classes: [{ name: 'Test' }] } });
    sub.markEvaluating();
    sub.markEvaluated();
    assert.throws(() => sub.markEvaluating());
  });
});