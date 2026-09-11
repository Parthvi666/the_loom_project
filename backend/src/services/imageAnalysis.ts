import { callAi, parseAiJson } from './aiClient';

type Analysis = { category: string; craft: string; visualDescription: string; confidence: number; fallback?: boolean };
const fallback: Analysis = { category: 'Handicrafts', craft: 'Traditional handmade craft', visualDescription: 'A handmade product photographed for catalogue preparation.', confidence: 0.5, fallback: true };

export async function analyzeImage(imageDataUrl?: string): Promise<Analysis> {
	try {
		const response = await callAi('Identify the likely product category from Textiles, Jewellery, Home Decor, Artwork, Handicrafts, or Other; likely craft or technique; and a one-line visual description. Return JSON only with category, craft, visualDescription, confidence.', imageDataUrl);
		const value = parseAiJson<Analysis>(response);
		const categories = ['Textiles', 'Jewellery', 'Home Decor', 'Artwork', 'Handicrafts', 'Other'];
		return { ...fallback, ...value, category: categories.includes(value.category) ? value.category : fallback.category, confidence: Number(value.confidence) || fallback.confidence, fallback: false };
	} catch { return fallback; }
}