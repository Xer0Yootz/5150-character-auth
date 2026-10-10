import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import geoip from 'geoip-lite';
import db, {
  comparePassword,
  createCharacter,
  createUser,
  findUserByEmail,
  findUserById,
  getCharacterByUserId,
  getUserRepos,
  hashPassword,
  publicUser,
  saveRepo
} from './db.js';
import { assignCaste } from './caste-logic.js';
import BitChatService, { getBitChatStatus, toggleBitChat } from './bitchat-service.js';
import { getAbilityUnlock, searchRepos } from './github-service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const bitChat = new BitChatService(db);

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  next();
}

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Server is healthy' });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }
  const user = createUser({
    name: name.trim(),
    email,
    passwordHash: hashPassword(password)
  });
  req.session.userId = user.id;
  res.status(201).json({ message: 'Signup successful', user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  const user = findUserByEmail(email);
  if (!user || !user.password_hash || !comparePassword(password, user.password_hash)) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  req.session.userId = user.id;
  res.json({ message: 'Login successful', user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out.' });
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = findUserById(req.session.userId);
  if (!user) return res.status(401).json({ message: 'User not found.' });
  res.json({
    user: publicUser(user),
    character: getCharacterByUserId(user.id),
    repos: getUserRepos(user.id)
  });
});

app.post('/api/character/assign', requireAuth, (req, res) => {
  const { codename, birthday, location, latitude, longitude } = req.body || {};
  if (!codename || !birthday || !location) {
    return res.status(400).json({ message: 'Codename, birthday, and location are required.' });
  }
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  const lookup = geoip.lookup(ip);
  const lat = latitude ?? lookup?.ll?.[0];
  const lon = longitude ?? lookup?.ll?.[1];
  if (lat == null || lon == null) {
    return res.status(400).json({ message: 'Latitude and longitude are required.' });
  }
  const result = assignCaste(birthday, lat, lon);
  const character = createCharacter({
    userId: req.session.userId,
    codename,
    birthday,
    location,
    latitude: lat,
    longitude: lon,
    zodiac: result.zodiac,
    climate: result.climate,
    element: result.element,
    caste: result.caste,
    tribe: result.tribe,
    abilities: result.abilities
  });
  res.status(201).json({ character, assignment: result });
});

app.get('/api/bitchat/status', requireAuth, async (req, res) => {
  res.json(await getBitChatStatus());
});

app.post('/api/bitchat/connect', requireAuth, async (req, res) => {
  const { enabled } = req.body || {};
  res.json({ status: await toggleBitChat(Boolean(enabled)) });
});

app.post('/api/bitchat/keypair', requireAuth, (req, res) => {
  const keys = bitChat.generateKeypair();
  bitChat.saveKeypair(req.session.userId, keys.publicKey, keys.secretKey);
  res.json({ publicKey: keys.publicKey });
});

app.post('/api/bitchat/group', requireAuth, (req, res) => {
  const { name, members } = req.body || {};
  if (!name) return res.status(400).json({ message: 'Group name is required.' });
  const groupId = bitChat.createGroupChat(name, req.session.userId, Array.isArray(members) ? members : []);
  res.status(201).json({ groupId });
});

app.post('/api/bitchat/message', requireAuth, (req, res) => {
  const { recipientId, groupId, message } = req.body || {};
  if (!message || (!recipientId && !groupId)) {
    return res.status(400).json({ message: 'Message and a recipient or group are required.' });
  }
  const sender = findUserById(req.session.userId);
  const senderKeys = bitChat.getKeypair(req.session.userId);
  const targetKeys = bitChat.getKeypair(recipientId || req.session.userId);
  if (!senderKeys || !targetKeys) {
    return res.status(400).json({ message: 'Both sides need a keypair first.' });
  }
  const encrypted = bitChat.encryptMessage(senderKeys.secret_key, targetKeys.public_key, message);
  if (!encrypted) return res.status(400).json({ message: 'Encrypt failed.' });
  const id = bitChat.saveMessage(
    sender.id,
    sender.name,
    recipientId || null,
    encrypted.ciphertext,
    encrypted.nonce,
    groupId || null
  );
  res.status(201).json({ id, ...encrypted });
});

app.get('/api/bitchat/group/:id', requireAuth, (req, res) => {
  const rows = bitChat.getGroupMessages(req.params.id);
  const viewerKeys = bitChat.getKeypair(req.session.userId);
  const messages = rows.map((row) => {
    const senderKey = bitChat.getKeypair(row.sender_id);
    const text = viewerKeys && senderKey
      ? bitChat.decryptMessage(viewerKeys.secret_key, senderKey.public_key, row.ciphertext, row.nonce)
      : null;
    return {
      id: row.id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      text,
      createdAt: row.created_at
    };
  });
  res.json({ messages });
});

app.get('/api/github/search', requireAuth, async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) return res.status(400).json({ message: 'Query is required.' });
  const user = findUserById(req.session.userId);
  const token = user?.github_token || process.env.GITHUB_API_TOKEN;
  const repos = await searchRepos(query, token);
  const withUnlocks = repos.map((repo) => ({
    ...repo,
    ability: getAbilityUnlock(repo.name, repo.language)
  }));
  res.json({ repos: withUnlocks });
});

app.post('/api/github/save', requireAuth, (req, res) => {
  const { name, url, owner, language } = req.body || {};
  if (!name || !url || !owner) {
    return res.status(400).json({ message: 'Repo name, url, and owner are required.' });
  }
  const character = getCharacterByUserId(req.session.userId);
  if (!character) return res.status(400).json({ message: 'Create a character first.' });
  const ability = getAbilityUnlock(name, language);
  saveRepo(req.session.userId, character.id, name, url, owner, ability);
  res.status(201).json({ ability, repos: getUserRepos(req.session.userId) });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
