import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProblems } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = ({ learnerId }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadProblems = async () => {
      try {
        const data = await fetchProblems();
        setProblems(data);
      } catch (err) {
        setError('Failed to load problems. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    loadProblems();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="panel"><p style={{color: 'var(--error)'}}>{error}</p></div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Practice Problems</h1>
      <div className="problem-grid">
        {problems.map(problem => (
          <div key={problem.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{problem.title}</h2>
              <span className={`badge badge-${problem.difficulty || 'medium'}`}>{problem.difficulty || 'medium'}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', minHeight: '3rem' }}>
              {problem.description?.substring(0, 100)}...
            </p>
            <div style={{ fontSize: '0.875rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              <strong>{problem.requirements?.length || 0}</strong> requirements
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-primary"
                onClick={() => navigate(`/practice/${problem.id}`)}
              >
                Start Practice
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => navigate(`/history/${problem.id}`)}
              >
                View History
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
