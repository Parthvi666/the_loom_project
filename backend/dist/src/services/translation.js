"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateText = translateText;
exports.normalizeLanguageCode = normalizeLanguageCode;
// Prepares a translation request for the AI client.
const aiClient_1 = require("./aiClient");
async function translateText(input, language = 'Hindi') {
    try {
        const response = await (0, aiClient_1.callAi)(`Translate to ${language}: ${input}`);
        const parsed = (0, aiClient_1.parseAiJson)(response);
        return parsed.translatedText ?? response.trim();
    }
    catch {
        return input;
    }
}
function normalizeLanguageCode(value) {
    const normalized = String(value || 'en').toLowerCase();
    if (normalized.startsWith('gu'))
        return 'Gujarati';
    if (normalized.startsWith('hi'))
        return 'Hindi';
    return 'English';
}
