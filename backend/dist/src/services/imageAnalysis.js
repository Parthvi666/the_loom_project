"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImage = analyzeImage;
const aiClient_1 = require("./aiClient");
const fallback = { category: 'Handicrafts', craft: 'Traditional handmade craft', visualDescription: 'A handmade product photographed for catalogue preparation.', confidence: 0.5, fallback: true };
async function analyzeImage(imageDataUrl) {
    try {
        const response = await (0, aiClient_1.callAi)('Identify the likely product category from Textiles, Jewellery, Home Decor, Artwork, Handicrafts, or Other; likely craft or technique; and a one-line visual description. Return JSON only with category, craft, visualDescription, confidence.', imageDataUrl);
        const value = (0, aiClient_1.parseAiJson)(response);
        const categories = ['Textiles', 'Jewellery', 'Home Decor', 'Artwork', 'Handicrafts', 'Other'];
        return { ...fallback, ...value, category: categories.includes(value.category) ? value.category : fallback.category, confidence: Number(value.confidence) || fallback.confidence, fallback: false };
    }
    catch {
        return fallback;
    }
}
