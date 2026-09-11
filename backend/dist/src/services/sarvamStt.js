"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeWithSarvam = transcribeWithSarvam;
// Calls Sarvam's documented REST Speech-to-Text API from the backend only.
const sarvamUrl = 'https://api.sarvam.ai/speech-to-text';
async function transcribeWithSarvam(audio, mimeType, languageCode, filename) {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey)
        throw new Error('SARVAM_API_KEY is not configured');
    const form = new FormData();
    const audioBuffer = audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength);
    form.append('file', new Blob([audioBuffer], { type: mimeType }), filename);
    form.append('language_code', languageCode || 'unknown');
    form.append('model', process.env.SARVAM_STT_MODEL ?? 'saaras:v3');
    form.append('mode', 'transcribe');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
        const result = await fetch(sarvamUrl, {
            method: 'POST',
            headers: { 'api-subscription-key': apiKey },
            body: form,
            signal: controller.signal,
        });
        const payload = await result.json().catch(() => ({}));
        if (!result.ok || !payload.transcript)
            throw new Error(payload.error ?? payload.message ?? `Sarvam request failed (${result.status})`);
        return payload.transcript;
    }
    finally {
        clearTimeout(timeout);
    }
}
