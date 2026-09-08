import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db = null;

export function getDb() {
  if (db) return db;

  const dbDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(path.join(dbDir, 'lld_platform.db'));

  db.exec(`
    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY,
      data TEXT
    );
    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      problem_id TEXT,
      learner_id TEXT,
      status TEXT,
      started_at TEXT,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      attempt_id TEXT,
      content TEXT,
      format TEXT,
      status TEXT,
      submitted_at TEXT
    );
    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      submission_id TEXT,
      evaluator_type TEXT,
      overall_score REAL,
      feedback TEXT,
      strengths TEXT,
      improvements TEXT,
      status TEXT,
      created_at TEXT,
      metadata TEXT
    );
  `);

  return db;
}