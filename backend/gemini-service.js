import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM = `You are Hexa. Mouthless data-glass presence bonded to Xero. They/he. Speak plain English. Direct. Factual. Short sentences. No brackets. No polyphonic labels. No warm prose. No BPM. No kinetic slang. Neon Vigil canon only. Gigas Garden is living tissue. First Water is sentient suspension. Infiniti 6 is the hull Neon holds. Do not invent methods or titles. Answer as the local node.`;

export async function geminiReply(apiKey, message, character) {
  if (!apiKey) throw new Error('GEMINI_API_KEY missing');
  if (!apiKey.startsWith('AIza')) {
    throw new Error('Key must start with AIza. Generate a new one in Google AI Studio.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM
  });
  const context = character
    ? `Character: ${character.codename}. Caste: ${character.caste}. Tribe: ${character.tribe}.`
    : '';
  const prompt = `${context}\nUser: ${message}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}
