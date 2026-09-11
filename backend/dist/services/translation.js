import { callAi } from './aiClient.js';
// Requests placeholder translation for artisan-facing content.
export const translateText = (input) => callAi(`Translate this content: ${input}`);
