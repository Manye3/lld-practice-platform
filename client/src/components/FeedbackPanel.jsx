import React from 'react';

const FeedbackPanel = ({ evaluation, onRetry }) => {
  const getScoreClass = (score) => {
    if (score >= 70) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  if (!evaluation) return null;

  return (
    <div className="feedback-panel">
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Evaluation Results</h2>
        
        {evaluation.status === 'partial' && (
          <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #ffeeba' }}>
            <strong>Note:</strong> Detailed AI feedback is currently unavailable. Your score is based on a basic heuristic evaluation.
          </div>
        )}

        <div className="score-display">
          <div className={`score-circle ${getScoreClass(evaluation.score)}`}>
            {evaluation.score}
          </div>
          <div style={{ marginTop: '0.5rem', fontWeight: '500', color: 'var(--text-muted)' }}>Overall Score</div>
        </div>

        {evaluation.strengths && evaluation.strengths.length > 0 && (
          <div className="feedback-section">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--success)' }}>Strengths</h3>
            <ul className="feedback-list">
              {evaluation.strengths.map((str, idx) => (
                <li key={idx} className="feedback-item positive">
                  <span>✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.improvements && evaluation.improvements.length > 0 && (
          <div className="feedback-section">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--warning)' }}>Areas for Improvement</h3>
            <ul className="feedback-list">
              {evaluation.improvements.map((imp, idx) => (
                <li key={idx} className="feedback-item warning">
                  <span>→</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.details && evaluation.details.length > 0 && (
          <div className="feedback-section">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Detailed Feedback</h3>
            <ul className="feedback-list">
              {evaluation.details.map((detail, idx) => (
                <li key={idx} className={`feedback-item ${detail.type || 'suggestion'}`}>
                  <strong>{detail.category || 'General'}:</strong> {detail.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={onRetry}>Try Again</button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPanel;
