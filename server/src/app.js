import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';
import { ProblemRepository } from './repository/ProblemRepository.js';
import { Problem } from './domain/Problem.js';
import { problems } from './seed/problems.js';

import problemRoutes from './api/problemRoutes.js';
import attemptRoutes from './api/attemptRoutes.js';
import submissionRoutes from './api/submissionRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/problems', problemRoutes);
app.use('/api/problems/:problemId/attempts', attemptRoutes);
app.use('/api/attempts/:attemptId/submissions', submissionRoutes);
app.use('/api/submissions', submissionRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Startup seed check
const problemRepo = new ProblemRepository();
if (problemRepo.count() === 0) {
  console.log('No problems found, running seed...');
  problems.forEach(pData => {
    problemRepo.save(Problem.create(pData));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});