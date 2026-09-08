import express from 'express';
import { PracticeService } from '../services/PracticeService.js';

const router = express.Router({ mergeParams: true });
const practiceService = new PracticeService();

router.post('/', (req, res) => {
  const { problemId } = req.params;
  const { learnerId } = req.body;
  if (!learnerId) return res.status(400).json({ error: 'learnerId is required' });

  const attempt = practiceService.startAttempt(problemId, learnerId);
  res.status(201).json(attempt);
});

router.get('/history', (req, res) => {
  const { problemId } = req.params;
  const { learnerId } = req.query;
  if (!learnerId) return res.status(400).json({ error: 'learnerId query parameter is required' });

  const history = practiceService.getAttemptHistory(problemId, learnerId);
  res.json(history);
});

export default router;