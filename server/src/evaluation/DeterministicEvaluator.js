import { Evaluator } from './Evaluator.js';
import { Evaluation } from '../domain/Evaluation.js';
import { FeedbackItem } from '../domain/FeedbackItem.js';

export class DeterministicEvaluator extends Evaluator {
  constructor() {
    super('deterministic');
  }

  async evaluate(submission, problem) {
    const feedback = [];
    let score = 0;

    const classes = submission.content.classes || [];
    const relationships = submission.content.relationships || [];
    const classNames = classes.map(c => c.name.toLowerCase());

    // 1. Entity Coverage (30 pts)
    let entitiesFound = 0;
    if (problem.keyEntities.length > 0) {
      problem.keyEntities.forEach(ent => {
        if (classNames.includes(ent.name.toLowerCase())) {
          entitiesFound++;
        } else {
          feedback.push(new FeedbackItem({
            category: 'entity_coverage',
            severity: 'warning',
            message: `Missing key entity: ${ent.name}`,
            details: `Consider adding a ${ent.name} class to represent this domain concept.`
          }));
        }
      });
      if (entitiesFound === problem.keyEntities.length && problem.keyEntities.length > 0) {
        feedback.push(new FeedbackItem({
          category: 'entity_coverage',
          severity: 'positive',
          message: 'All core domain entities identified successfully.',
          details: `Found: ${problem.keyEntities.map(e => e.name).join(', ')}`
        }));
      }
      score += (entitiesFound / problem.keyEntities.length) * 30;
    } else {
      score += 30;
    }

    // 2. Relationship Coverage (25 pts)
    if (relationships.length === 0) {
      feedback.push(new FeedbackItem({
        category: 'relationship_design',
        severity: 'warning',
        message: 'No relationships defined',
        details: 'Classes must interact. Define associations, aggregations, or compositions.'
      }));
    } else {
      feedback.push(new FeedbackItem({
        category: 'relationship_design',
        severity: 'positive',
        message: `${relationships.length} relationship(s) clearly specified between entities.`
      }));
      score += 25;
    }

    // 3. Responsibility Assignment (25 pts)
    let srpViolations = 0;
    let classesWithResponsibilities = 0;
    classes.forEach(c => {
      if (!c.responsibilities || c.responsibilities.length === 0) {
        feedback.push(new FeedbackItem({
          category: 'responsibility_assignment',
          severity: 'suggestion',
          message: `${c.name} has no clear responsibilities.`,
          relatedEntity: c.name
        }));
      } else if (c.responsibilities.length > 5) {
        srpViolations++;
        feedback.push(new FeedbackItem({
          category: 'solid_principles',
          severity: 'warning',
          message: `${c.name} might violate Single Responsibility Principle.`,
          details: 'It has too many responsibilities. Consider splitting it.',
          relatedEntity: c.name
        }));
      } else {
        classesWithResponsibilities++;
      }
    });

    if (srpViolations === 0 && classesWithResponsibilities > 0) {
      feedback.push(new FeedbackItem({
        category: 'responsibility_assignment',
        severity: 'positive',
        message: 'Responsibilities appear well-scoped without obvious SRP bloat.'
      }));
    }

    score += Math.max(0, 25 - (srpViolations * 5));

    // 4. Design Completeness (20 pts)
    if (classes.length < 2) {
      feedback.push(new FeedbackItem({
        category: 'general',
        severity: 'critical',
        message: 'Design is too simple, missing essential domain abstraction.'
      }));
    } else {
      feedback.push(new FeedbackItem({
        category: 'general',
        severity: 'positive',
        message: `Modular design with ${classes.length} distinct classes.`
      }));
      score += 20;
    }

    const strengths = [];
    const improvements = [];
    if (entitiesFound === problem.keyEntities.length && problem.keyEntities.length > 0) {
      strengths.push('Excellent entity coverage, all key domain models identified.');
    }
    if (srpViolations > 0) {
      improvements.push('Review classes for Single Responsibility Principle (SRP).');
    }

    return new Evaluation({
      submissionId: submission.id,
      evaluatorType: this.name,
      overallScore: Math.round(score),
      feedback,
      strengths,
      improvements,
      status: 'completed'
    });
  }
}