import { callAi } from './aiClient.js';
// Requests placeholder product insights from an image prompt.
export const analyzeImage = (input) => callAi(`Analyze this product image: ${input}`);
