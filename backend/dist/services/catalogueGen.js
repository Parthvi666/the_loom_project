import { callAi } from './aiClient.js';
// Requests placeholder catalogue copy for a product.
export const generateCatalogue = (input) => callAi(`Generate catalogue copy: ${input}`);
