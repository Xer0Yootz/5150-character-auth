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
    element TEXT,
    zodiac TEXT,
    caste TEXT,
    tribe TEXT,
    description TEXT,
    abilities TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bitchat_keys (
    user_id TEXT PRIMARY KEY,
    public_key TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bitchat_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bitchat_group_members (
    group_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    PRIMARY KEY (group_id, member_id)
  );

  CREATE TABLE IF NOT EXISTS bitchat_messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT,
    recipient_id TEXT,
    ciphertext TEXT NOT NULL,
    nonce TEXT NOT NULL,
    group_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

function ensureColumn(name, type) {
  const columns = db.prepare('PRAGMA table_info(users)').all();
  if (!columns.some((column) => column.name === name)) {
    db.exec(`ALTER TABLE users ADD COLUMN ${name} ${type}`);
  }
}

ensureColumn('element', 'TEXT');
ensureColumn('tribe', 'TEXT');
ensureColumn('description', 'TEXT');
ensureColumn('abilities', 'TEXT');

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
    'github_login', 'birth_date', 'latitude', 'longitude', 'climate', 'element',
    'zodiac', 'caste', 'tribe', 'description', 'abilities'
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
    element: user.element,
    zodiac: user.zodiac,
    caste: user.caste,
    tribe: user.tribe,
    description: user.description,
    abilities: user.abilities ? JSON.parse(user.abilities) : []
  };
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export default db;
