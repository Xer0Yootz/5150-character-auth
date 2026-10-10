# 5150 Character Auth

Backend scaffold for session auth, location climate, zodiac caste, BitChat, and GitHub ability unlocks.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Server listens on http://localhost:4000.

## Routes

- GET /health
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/character/assign
- GET /api/bitchat/status
- POST /api/bitchat/connect
- GET /api/github/abilities

Database is SQLite at backend/data/users.db. Not MongoDB.

Caste map is a first pass. Not final canon.
BitChat is a stub until a real endpoint is set.
