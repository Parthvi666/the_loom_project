import { callAi } from './aiClient.js';
// Requests a placeholder recommended price for a product.
export const recommendPrice = (input) => callAi(`Recommend a product price: ${input}`);
