import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'app.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    provider TEXT DEFAULT 'local',
    google_id TEXT,
    github_id TEXT,
    github_token TEXT,
    bitchat_public_key TEXT,
    bitchat_secret_key TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    codename TEXT NOT NULL,
    birthday TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    zodiac TEXT,
    climate TEXT,
    element TEXT,
    caste TEXT,
    tribe TEXT,
    abilities TEXT,
    github_upgrades TEXT DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS repos (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    character_id TEXT,
    repo_name TEXT,
    repo_url TEXT,
    repo_owner TEXT,
    ability_unlock TEXT,
    saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (character_id) REFERENCES characters(id)
  );

  CREATE TABLE IF NOT EXISTS bitchat_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bitchat_messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    recipient_id TEXT,
    ciphertext TEXT NOT NULL,
    nonce TEXT NOT NULL,
    group_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES bitchat_groups(id)
  );

  CREATE TABLE IF NOT EXISTS bitchat_group_members (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES bitchat_groups(id),
    FOREIGN KEY (member_id) REFERENCES users(id)
  );
`);

export function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase()) || null;
}

export function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) || null;
}

export function createUser({ name, email, passwordHash, provider = 'local', googleId = null, githubId = null, githubToken = null }) {
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, provider, google_id, github_id, github_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, email.toLowerCase(), passwordHash, provider, googleId, githubId, githubToken);
  return findUserById(id);
}

export function updateUser(id, updates) {
  const allowed = new Set([
    'name', 'email', 'password_hash', 'provider', 'google_id', 'github_id',
    'github_token', 'bitchat_public_key', 'bitchat_secret_key'
  ]);
  const keys = Object.keys(updates).filter((key) => allowed.has(key));
  if (!keys.length) return findUserById(id);
  const values = keys.map((key) => updates[key]);
  const sql = `UPDATE users SET ${keys.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...values, id);
  return findUserById(id);
}

export function createCharacter({
  userId, codename, birthday, location, latitude, longitude,
  zodiac, climate, element, caste, tribe, abilities
}) {
  const id = `char_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  db.prepare(`
    INSERT INTO characters (
      id, user_id, codename, birthday, location, latitude, longitude,
      zodiac, climate, element, caste, tribe, abilities
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, userId, codename, birthday, location, latitude, longitude,
    zodiac, climate, element, caste, tribe, JSON.stringify(abilities || [])
  );
  return getCharacterById(id);
}

export function getCharacterById(id) {
  const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
  if (!character) return null;
  character.abilities = JSON.parse(character.abilities || '[]');
  character.github_upgrades = JSON.parse(character.github_upgrades || '[]');
  return character;
}

export function getCharacterByUserId(userId) {
  const character = db.prepare('SELECT * FROM characters WHERE user_id = ? LIMIT 1').get(userId);
  if (!character) return null;
  character.abilities = JSON.parse(character.abilities || '[]');
  character.github_upgrades = JSON.parse(character.github_upgrades || '[]');
  return character;
}

export function saveRepo(userId, characterId, repoName, repoUrl, repoOwner, abilityUnlock) {
  const id = `repo_${Date.now()}`;
  db.prepare(`
    INSERT INTO repos (id, user_id, character_id, repo_name, repo_url, repo_owner, ability_unlock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, characterId, repoName, repoUrl, repoOwner, abilityUnlock);
}

export function getUserRepos(userId) {
  return db.prepare('SELECT * FROM repos WHERE user_id = ? ORDER BY saved_at DESC').all(userId);
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    provider: user.provider,
    githubId: user.github_id
  };
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export default db;
