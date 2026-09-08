import crypto from 'crypto';

export class Attempt {
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.problemId = data.problemId;
    this.learnerId = data.learnerId;
    this.status = data.status || 'in_progress';
    this.startedAt = data.startedAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  markSubmitted() {
    this.status = 'submitted';
    this.updatedAt = new Date().toISOString();
  }

  markEvaluated() {
    this.status = 'evaluated';
    this.updatedAt = new Date().toISOString();
  }
}