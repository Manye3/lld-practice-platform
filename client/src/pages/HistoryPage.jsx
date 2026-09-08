import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchHistory, fetchProblem } from '../api';
import FeedbackPanel from '../components/FeedbackPanel';
import LoadingSpinner from '../components/LoadingSpinner';

const HistoryPage = ({ learnerId }) => {
  const { problemId } = useParams();
  const [history, setHistory] = useState([]);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [hData, pData] = await Promise.all([
          fetchHistory(problemId, learnerId),
          fetchProblem(problemId)
        ]);
        setHistory(hData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setProblem(pData);
      } catch (err) {
        setError('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [problemId, learnerId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="card"><p style={{color: 'var(--error)'}}>{error}</p></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>History: {problem?.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>You have {history.length} past attempts for this problem.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`/practice/${problemId}`)}>
          Practice Again
        </button>
      </div>

      {history.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No history found for this problem.</p>
        </div>
      ) : (
        <div className="history-timeline">
          {history.map((attempt, index) => {
            const submission = attempt.submission;
            if (!submission) return null; 
            const evaluation = attempt.evaluation;
            
            const isExpanded = expandedId === attempt.id;
            
            return (
              <div key={attempt.id} className="card">
                <div 
                  className="history-card" 
                  onClick={() => setExpandedId(isExpanded ? null : attempt.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: isExpanded ? '1.5rem' : 0 }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Attempt {history.length - index}</h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {new Date(attempt.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {evaluation && (
                      <div className="badge" style={{ 
                        backgroundColor: evaluation.score >= 70 ? '#dcfce7' : evaluation.score >= 40 ? '#fef9c3' : '#fee2e2',
                        color: evaluation.score >= 70 ? '#166534' : evaluation.score >= 40 ? '#854d0e' : '#991b1b',
                        fontSize: '1rem', padding: '0.5rem 1rem'
                      }}>
                        Score: {evaluation.score}
                      </div>
                    )}
                    <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>
                      {isExpanded ? '▾' : '▸'}
                    </span>
                  </div>
                </div>
                
                {isExpanded && evaluation && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <FeedbackPanel evaluation={evaluation} onRetry={() => navigate(`/practice/${problemId}`)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
