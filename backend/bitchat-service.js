import dotenv from 'dotenv';

dotenv.config();

export const bitchatConfig = {
  enabled: String(process.env.BITCHAT_ENABLED || 'false').toLowerCase() === 'true',
  baseUrl: process.env.BITCHAT_BASE_URL || '',
  apiKey: process.env.BITCHAT_API_KEY || ''
};

export async function getBitChatStatus() {
  if (!bitchatConfig.enabled || !bitchatConfig.baseUrl || !bitchatConfig.apiKey) {
    return {
      connected: false,
      platforms: ['android', 'mac'],
      notes: 'BitChat is not configured. Set BITCHAT_ENABLED, BITCHAT_BASE_URL, and BITCHAT_API_KEY.'
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
    return { connected: false, notes: 'BitChat is not configured.' };
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
