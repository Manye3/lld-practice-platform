export class Evaluator {
  constructor(name) {
    this.name = name;
  }
  async evaluate(submission, problem) {
    throw new Error('evaluate() must be implemented by subclass');
  }
}