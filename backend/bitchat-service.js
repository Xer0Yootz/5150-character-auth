import dotenv from 'dotenv';
import nacl from 'tweetnacl';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const bitchatConfig = {
  enabled: String(process.env.BITCHAT_ENABLED || 'false').toLowerCase() === 'true',
  baseUrl: process.env.BITCHAT_BASE_URL || '',
  apiKey: process.env.BITCHAT_API_KEY || ''
};

export class BitChatService {
  constructor(db) {
    this.db = db;
  }

  generateKeypair() {
    const { publicKey, secretKey } = nacl.box.keyPair();
    return {
      publicKey: Buffer.from(publicKey).toString('hex'),
      secretKey: Buffer.from(secretKey).toString('hex')
    };
  }

  encryptMessage(senderSecretKey, recipientPublicKey, message) {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageBytes = encoder.encode(message);
    const senderSecret = Buffer.from(senderSecretKey, 'hex');
    const recipientPub = Buffer.from(recipientPublicKey, 'hex');
    const encrypted = nacl.box(messageBytes, nonce, recipientPub, senderSecret);
    if (!encrypted) return null;
    return {
      ciphertext: Buffer.from(encrypted).toString('hex'),
      nonce: Buffer.from(nonce).toString('hex')
    };
  }

  decryptMessage(recipientSecretKey, senderPublicKey, ciphertext, nonce) {
    const recipientSecret = Buffer.from(recipientSecretKey, 'hex');
    const senderPub = Buffer.from(senderPublicKey, 'hex');
    const cipherBytes = Buffer.from(ciphertext, 'hex');
    const nonceBytes = Buffer.from(nonce, 'hex');
    const decrypted = nacl.box.open(cipherBytes, nonceBytes, senderPub, recipientSecret);
    if (!decrypted) return null;
    return decoder.decode(decrypted);
  }

  saveKeypair(userId, publicKey, secretKey) {
    this.db.prepare(`
      INSERT INTO bitchat_keys (user_id, public_key, secret_key, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        public_key = excluded.public_key,
        secret_key = excluded.secret_key,
        created_at = CURRENT_TIMESTAMP
    `).run(userId, publicKey, secretKey);
  }

  getKeypair(userId) {
    return this.db.prepare('SELECT * FROM bitchat_keys WHERE user_id = ?').get(userId) || null;
  }

  saveMessage(senderId, senderName, recipientId, ciphertext, nonce, groupId = null) {
    const id = uuidv4();
    this.db.prepare(`
      INSERT INTO bitchat_messages (id, sender_id, sender_name, recipient_id, ciphertext, nonce, group_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(id, senderId, senderName, recipientId, ciphertext, nonce, groupId);
    return id;
  }

  getGroupMessages(groupId, limit = 50) {
    return this.db.prepare(`
      SELECT * FROM bitchat_messages
      WHERE group_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(groupId, limit).reverse();
  }

  createGroupChat(groupName, creatorId, members) {
    const id = uuidv4();
    this.db.prepare(`
      INSERT INTO bitchat_groups (id, name, creator_id, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(id, groupName, creatorId);

    const uniqueMembers = new Set([creatorId, ...members]);
    for (const memberId of uniqueMembers) {
      this.db.prepare(`
        INSERT OR IGNORE INTO bitchat_group_members (group_id, member_id)
        VALUES (?, ?)
      `).run(id, memberId);
    }
    return id;
  }
}

export async function getBitChatStatus() {
  if (!bitchatConfig.enabled || !bitchatConfig.baseUrl || !bitchatConfig.apiKey) {
    return {
      connected: false,
      platforms: ['android', 'mac'],
      notes: 'Local BitChat store is ready. Remote endpoint is not configured.'
    };
  }
  try {
    const response = await fetch(`${bitchatConfig.baseUrl}/status`, {
      headers: { Authorization: `Bearer ${bitchatConfig.apiKey}` }
    });
    if (!response.ok) {
      return { connected: false, platforms: ['android', 'mac'], notes: 'BitChat is configured but unavailable.' };
    }
    const payload = await response.json();
    return {
      connected: true,
      platforms: payload.platforms || ['android', 'mac'],
      notes: payload.message || 'BitChat is active.'
    };
  } catch {
    return { connected: false, platforms: ['android', 'mac'], notes: 'BitChat connection failed.' };
  }
}

export async function toggleBitChat(enabled) {
  if (!bitchatConfig.enabled || !bitchatConfig.baseUrl || !bitchatConfig.apiKey) {
    return { connected: false, notes: 'BitChat remote endpoint is not configured.' };
  }
  try {
    const response = await fetch(`${bitchatConfig.baseUrl}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bitchatConfig.apiKey}`
      },
      body: JSON.stringify({ enabled })
    });
    if (!response.ok) return { connected: false, notes: 'BitChat toggle failed.' };
    const payload = await response.json();
    return { connected: Boolean(enabled && payload.connected), notes: payload.message || 'BitChat updated.' };
  } catch {
    return { connected: false, notes: 'BitChat toggle failed.' };
  }
}

export default BitChatService;
