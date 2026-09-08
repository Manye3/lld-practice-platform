export class FeedbackItem {
  constructor({ category, severity, message, details, relatedEntity }) {
    this.category = category;
    this.severity = severity;
    this.message = message;
    this.details = details;
    this.relatedEntity = relatedEntity;
  }
}