import crypto from 'crypto';

export class Evaluation {
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.submissionId = data.submissionId;
    this.evaluatorType = data.evaluatorType;
    this.overallScore = data.overallScore || 0;
    this.feedback = data.feedback || [];
    this.strengths = data.strengths || [];
    this.improvements = data.improvements || [];
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.metadata = data.metadata || {};
  }
}