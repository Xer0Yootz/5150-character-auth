import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'users.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    provider TEXT NOT NULL DEFAULT 'local',
    google_id TEXT,
    github_id TEXT,
    github_login TEXT,
    birth_date TEXT,
    latitude REAL,
    longitude REAL,
    climate TEXT,
    zodiac TEXT,
    caste TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

export function findUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(normalized) || null;
}

export function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) || null;
}

export function createUser({ name, email, passwordHash, provider = 'local' }) {
  const userId = `user_${crypto.randomBytes(8).toString('hex')}`;
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, provider, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(userId, name, email.trim().toLowerCase(), passwordHash, provider);
  return findUserById(userId);
}

export function updateUserById(id, updates) {
  const allowed = new Set([
    'name', 'email', 'password_hash', 'provider', 'google_id', 'github_id',
    'github_login', 'birth_date', 'latitude', 'longitude', 'climate', 'zodiac', 'caste'
  ]);
  const fields = [];
  const values = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (allowed.has(key) && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (!fields.length) return findUserById(id);

  values.push(id);
  db.prepare(`UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
  return findUserById(id);
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    provider: user.provider,
    githubLogin: user.github_login,
    birthDate: user.birth_date,
    climate: user.climate,
    zodiac: user.zodiac,
    caste: user.caste
  };
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export default db;
