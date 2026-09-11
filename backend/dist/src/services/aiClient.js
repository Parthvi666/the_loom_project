"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callAi = callAi;
exports.parseAiJson = parseAiJson;
// Single AI boundary. Keep provider-specific code here so services can be swapped later.
async function callAi(prompt, imageDataUrl) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
        throw new Error('OPENAI_API_KEY is not configured');
    const content = [{ type: 'text', text: prompt }];
    if (imageDataUrl)
        content.push({ type: 'image_url', image_url: { url: imageDataUrl } });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini', temperature: 0.2, response_format: { type: 'json_object' }, messages: [{ role: 'user', content }] }),
            signal: controller.signal,
        });
        if (!response.ok)
            throw new Error(`AI request failed: ${response.status}`);
        const payload = await response.json();
        const text = payload.choices?.[0]?.message?.content;
        if (!text)
            throw new Error('AI response was empty');
        return text;
    }
    finally {
        clearTimeout(timeout);
    }
}
function parseAiJson(value) {
    const cleaned = value.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(cleaned);
}
