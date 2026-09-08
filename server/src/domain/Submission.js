import crypto from 'crypto';

export class Submission {
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.attemptId = data.attemptId;
    this.content = data.content || { classes: [], relationships: [], designDecisions: [] };
    this.format = data.format || 'structured';
    this.status = data.status || 'pending';
    this.submittedAt = data.submittedAt || new Date().toISOString();
    
    if (!this.content.classes || this.content.classes.length === 0) {
      throw new Error("Submission content must have at least one class defined.");
    }
  }

  markEvaluating() {
    if (this.status !== 'pending') throw new Error("Can only evaluate a pending submission");
    this.status = 'evaluating';
  }

  markEvaluated() {
    if (this.status !== 'evaluating') throw new Error("Submission not in evaluating status");
    this.status = 'evaluated';
  }

  markFailed() {
    this.status = 'failed';
  }
}