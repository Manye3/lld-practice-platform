const BASE_URL = 'http://localhost:3001/api';

export const fetchProblems = async () => {
  const res = await fetch(`${BASE_URL}/problems`);
  if (!res.ok) throw new Error('Failed to fetch problems');
  return res.json();
};

export const fetchProblem = async (id) => {
  const res = await fetch(`${BASE_URL}/problems/${id}`);
  if (!res.ok) throw new Error('Failed to fetch problem');
  return res.json();
};

export const startAttempt = async (problemId, learnerId) => {
  const res = await fetch(`${BASE_URL}/problems/${problemId}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ learnerId })
  });
  if (!res.ok) throw new Error('Failed to start attempt');
  return res.json();
};

export const submitSolution = async (attemptId, content) => {
  const res = await fetch(`${BASE_URL}/attempts/${attemptId}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, format: 'structured' })
  });
  if (!res.ok) throw new Error('Failed to submit solution');
  return res.json();
};

export const fetchHistory = async (problemId, learnerId) => {
  const res = await fetch(`${BASE_URL}/problems/${problemId}/history?learnerId=${learnerId}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
};

export const fetchSubmission = async (id) => {
  const res = await fetch(`${BASE_URL}/submissions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch submission');
  return res.json();
};
