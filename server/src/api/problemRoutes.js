import express from 'express';
import { PracticeService } from '../services/PracticeService.js';

const router = express.Router();
const practiceService = new PracticeService();

router.get('/', (req, res) => {
  const problems = practiceService.getProblems();
  const safeProblems = problems.map(p => {
    const { keyEntities, expectedRelationships, ...safeP } = p;
    return safeP;
  });
  res.json(safeProblems);
});

router.get('/:id', (req, res) => {
  const problem = practiceService.getProblem(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });
  const { keyEntities, expectedRelationships, ...safeP } = problem;
  res.json(safeP);
});

export default router;