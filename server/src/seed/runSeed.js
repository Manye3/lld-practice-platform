import { getDb } from '../db.js';
import { ProblemRepository } from '../repository/ProblemRepository.js';
import { Problem } from '../domain/Problem.js';
import { problems } from './problems.js';

const repo = new ProblemRepository();

console.log('Seeding database...');
getDb().exec('DELETE FROM problems');

problems.forEach(pData => {
  const p = Problem.create(pData);
  repo.save(p);
  console.log(`Saved problem: ${p.title}`);
});

console.log('Database seeded successfully.');