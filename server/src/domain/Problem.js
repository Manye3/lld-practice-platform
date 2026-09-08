import crypto from 'crypto';

export class Problem {
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.title = data.title;
    this.description = data.description;
    this.requirements = data.requirements || [];
    this.context = data.context || '';
    this.hints = data.hints || [];
    this.difficulty = data.difficulty || 'medium';
    this.keyEntities = data.keyEntities || [];
    this.expectedRelationships = data.expectedRelationships || [];
  }

  static create(data) {
    if (!data.title) throw new Error("Title is required");
    if (!Array.isArray(data.requirements) || data.requirements.length === 0) {
      throw new Error("Requirements must be a non-empty array");
    }
    return new Problem(data);
  }
}