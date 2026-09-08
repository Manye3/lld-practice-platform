import express from 'express';
import { EvaluationService } from '../services/EvaluationService.js';

const router = express.Router({ mergeParams: true });
const evalService = new EvaluationService();

// POST /api/attempts/:attemptId/submissions
router.post('/', async (req, res) => {
  const { attemptId } = req.params;
  const { content, format } = req.body;

  try {
    const result = await evalService.submitSolution(attemptId, content, format);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/submissions/:id (Mounted differently in app.js probably, but let's assume standard mount)
router.get('/:id', (req, res) => {
  const result = evalService.getSubmissionWithEvaluation(req.params.id);
  if (!result) return res.status(404).json({ error: 'Submission not found' });
  res.json(result);
});

export default router;