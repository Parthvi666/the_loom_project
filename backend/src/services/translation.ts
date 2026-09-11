// Prepares a translation request for the AI client.
import { callAi, parseAiJson } from './aiClient';

export async function translateText(input: string, language = 'Hindi') {
  try {
    const response = await callAi(`Translate to ${language}: ${input}`);
    const parsed = parseAiJson<{ translatedText?: string }>(response);
    return parsed.translatedText ?? response.trim();
  } catch {
    return input;
  }
}

export function normalizeLanguageCode(value: string) {
  const normalized = String(value || 'en').toLowerCase();
  if (normalized.startsWith('gu')) return 'Gujarati';
  if (normalized.startsWith('hi')) return 'Hindi';
  return 'English';
}