import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import * as db from './db.js';
import { assignCaste, getStartingAbilities } from './caste-logic.js';
import BitChatService from './bitchat-service.js';
import { getAbilityUnlock, searchRepos } from './github-service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const bitChat = new BitChatService(db.default);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, db.findUserById(id)));

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  }, (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('No email from Google'));

      let user = db.findUserByEmail(email);
      if (user) {
        if (!user.google_id) {
          user = db.updateUser(user.id, { google_id: profile.id, provider: 'google' });
        }
        return done(null, user);
      }

      const newUser = db.createUser({
        name: profile.displayName || 'User',
        email,
        passwordHash: null,
        provider: 'google',
        googleId: profile.id
      });
      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/auth/github/callback',
    scope: ['user:email', 'repo']
  }, (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;

      let user = db.findUserByEmail(email);
      if (user) {
        if (!user.github_id) {
          user = db.updateUser(user.id, {
            github_id: profile.id,
            github_token: accessToken,
            provider: 'github'
          });
        }
        return done(null, user);
      }

      const newUser = db.createUser({
        name: profile.displayName || profile.username || 'User',
        email,
        passwordHash: null,
        provider: 'github',
        githubId: profile.id,
        githubToken: accessToken
      });
      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));
}

app.use(express.static(path.join(process.cwd(), 'web', 'public')));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  if (db.findUserByEmail(email)) return res.status(409).json({ message: 'Email already registered.' });

  const user = db.createUser({
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    passwordHash: db.hashPassword(password),
    provider: 'local'
  });

  req.login(user, (err) => {
    if (err) return res.status(500).json({ message: 'Login failed.' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, provider: user.provider } });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Missing fields.' });

  const user = db.findUserByEmail(email);
  if (!user || !user.password_hash) return res.status(401).json({ message: 'Invalid credentials.' });
  if (!db.comparePassword(password, user.password_hash)) return res.status(401).json({ message: 'Invalid credentials.' });

  req.login(user, (err) => {
    if (err) return res.status(500).json({ message: 'Login failed.' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, provider: user.provider } });
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out.' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated.' });
  const user = db.findUserById(req.user.id);
  if (!user) return res.status(401).json({ message: 'User not found.' });
  res.json({ user: { id: user.id, name: user.name, email: user.email, provider: user.provider } });
});

app.post('/api/character/create', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated.' });

  const { codename, birthday, location, latitude, longitude } = req.body || {};
  if (!codename || !birthday || !location || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Missing character fields.' });
  }

  const casteData = assignCaste(birthday, latitude, longitude);
  const abilities = getStartingAbilities(casteData.caste);
  const character = db.createCharacter({
    userId: req.user.id,
    codename,
    birthday,
    location,
    latitude,
    longitude,
    zodiac: casteData.zodiac,
    climate: casteData.climate,
    element: casteData.element,
    caste: casteData.caste,
    tribe: casteData.tribe,
    abilities
  });

  res.json({ character });
});

app.get('/api/character/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated.' });
  const character = db.getCharacterByUserId(req.user.id);
  if (!character) return res.status(404).json({ message: 'No character found.' });
  res.json({ character });
});

app.get('/api/repos/search', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated.' });
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ message: 'Search query required.' });

  const repos = await searchRepos(q, process.env.GITHUB_API_TOKEN);
  res.json({ repos });
});

app.post('/api/repos/save', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated.' });
  const { repoName, repoUrl, repoOwner, language } = req.body || {};
  if (!repoName || !repoUrl) return res.status(400).json({ message: 'Missing repo fields.' });

  const character = db.getCharacterByUserId(req.user.id);
  if (!character) return res.status(404).json({ message: 'No character.' });

  const abilityUnlock = getAbilityUnlock(repoName, language);
  db.saveRepo(req.user.id, character.id, repoName, repoUrl, repoOwner || 'unknown', abilityUnlock);
  res.json({ message: 'Saved.', ability: abilityUnlock });
});

app.get('/api/repos/saved', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated.' });
  res.json({ repos: db.getUserRepos(req.user.id) });
});

app.get('/api/bitchat/keypair', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated.' });

  let user = db.findUserById(req.user.id);
  if (!user.bitchat_public_key) {
    const keypair = bitChat.generateKeypair();
    user = db.updateUser(user.id, {
      bitchat_public_key: keypair.publicKey,
      bitchat_secret_key: keypair.secretKey
    });
  }

  res.json({
    publicKey: user.bitchat_public_key,
    userId: user.id
  });
});

app.get('/api/bitchat/groups', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated.' });

  const groups = db.default.prepare(`
    SELECT bg.* FROM bitchat_groups bg
    JOIN bitchat_group_members bgm ON bg.id = bgm.group_id
    WHERE bgm.member_id = ?
  `).all(req.user.id);

  res.json({ groups });
});

app.post('/api/bitchat/send', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated.' });

  const { recipientId, groupId, ciphertext, nonce } = req.body || {};
  if (!ciphertext || !nonce) return res.status(400).json({ message: 'Missing message data.' });

  const user = db.findUserById(req.user.id);
  bitChat.saveMessage(req.user.id, user.name, recipientId, ciphertext, nonce, groupId);
  res.json({ message: 'Sent.' });
});

app.get('/api/bitchat/messages/:groupId', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated.' });
  res.json({ messages: bitChat.getGroupMessages(req.params.groupId) });
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect(`${FRONTEND_URL}/dashboard`);
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  res.redirect(`${FRONTEND_URL}/dashboard`);
});

app.get('*', (req, res) => {
  const indexPath = path.join(process.cwd(), 'web', 'public', 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`5150 Auth running on http://localhost:${PORT}`);
});
