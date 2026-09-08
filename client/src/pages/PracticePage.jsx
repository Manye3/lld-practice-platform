import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProblem, startAttempt, submitSolution } from '../api';
import DesignEditor from '../components/DesignEditor';
import FeedbackPanel from '../components/FeedbackPanel';
import LoadingSpinner from '../components/LoadingSpinner';

const PracticePage = ({ learnerId }) => {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  const [content, setContent] = useState({
    classes: [{ id: Date.now().toString(), name: '', responsibilities: '', attributes: '' }],
    relationships: [],
    designDecisions: ''
  });

  const initAttempt = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setContent({
      classes: [{ id: Date.now().toString(), name: '', responsibilities: '', attributes: '' }],
      relationships: [],
      designDecisions: ''
    });
    
    try {
      const pData = await fetchProblem(problemId);
      setProblem(pData);
      const aData = await startAttempt(problemId, learnerId);
      setAttemptId(aData.id);
    } catch (err) {
      setError('Failed to initialize attempt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAttempt();
  }, [problemId, learnerId]);

  const handleSubmit = async () => {
    if (!content.classes || content.classes.length === 0 || !content.classes[0].name.trim()) {
      alert("Please define at least one class before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitSolution(attemptId, content);
      setResult(res.evaluation);
    } catch (err) {
      alert('Failed to submit solution.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="card"><p style={{color: 'var(--error)'}}>{error}</p></div>;
  if (!problem) return null;

  return (
    <div className="practice-layout">
      <div className="panel">
        <div className="card" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{problem.title}</h1>
            <span className={`badge badge-${problem.difficulty || 'medium'}`}>{problem.difficulty || 'medium'}</span>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Description</h3>
            <p>{problem.description}</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Requirements</h3>
            <ul style={{ paddingLeft: '1.5rem' }}>
              {problem.requirements && problem.requirements.map((req, i) => (
                <li key={i} style={{ marginBottom: '0.25rem' }}>{req}</li>
              ))}
            </ul>
          </div>
          
          {problem.context && (
            <div>
              <h3 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Context</h3>
              <p style={{ color: 'var(--text-muted)' }}>{problem.context}</p>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        {!result ? (
          <>
            <DesignEditor content={content} onChange={setContent} />
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={submitting || !content.classes.some(c => c.name.trim() !== '')}
              >
                {submitting ? 'Submitting...' : 'Submit Design'}
              </button>
            </div>
          </>
        ) : (
          <FeedbackPanel evaluation={result} onRetry={initAttempt} />
        )}
      </div>
    </div>
  );
};

export default PracticePage;
