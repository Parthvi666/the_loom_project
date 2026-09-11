import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';

const editTimeoutMs = 9000;

type CropParams = { left?: number; top?: number; width?: number; height?: number; size?: number };

async function editWithGemini(image: Buffer, prompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), editTimeoutMs);
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    const metadata = await sharp(image).metadata();
    const mimeType = metadata.format === 'jpeg' ? 'image/jpeg' : metadata.format === 'webp' ? 'image/webp' : 'image/png';
    const response = await new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }).models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data: image.toString('base64') } }, { text: prompt }] }],
      config: { responseModalities: ['IMAGE'], abortSignal: controller.signal },
    });
    const base64 = response.data;
    if (!base64) throw new Error('Gemini image edit returned no image data');
    return Buffer.from(base64, 'base64');
  } catch {
    throw new Error('This edit isn\'t available right now');
  } finally {
    clearTimeout(timeout);
  }
}

export function improveLighting(image: Buffer) {
  return editWithGemini(image, 'Enhance the lighting and exposure of this product photo naturally, keep the product itself completely unchanged and recognizable');
}

export function removeBackground(image: Buffer) {
  return editWithGemini(image, 'Remove the background completely, leave only the product, clean plain background, do not alter the product itself');
}

export function removeDistractions(image: Buffer) {
  return editWithGemini(image, 'Remove any clutter or distracting background elements, keep the background simple and clean, do not alter the product itself');
}

export async function cropAndResize(image: Buffer, params: CropParams = {}) {
  const metadata = await sharp(image).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  if (!width || !height) throw new Error('Unable to read image dimensions');
  const size = Math.max(1, Math.min(params.size ?? Math.min(width, height), width, height));
  const left = Math.max(0, Math.min(params.left ?? Math.floor((width - size) / 2), width - size));
  const top = Math.max(0, Math.min(params.top ?? Math.floor((height - size) / 2), height - size));
  return sharp(image).extract({ left, top, width: size, height: size }).resize(900, 900, { fit: 'cover' }).png().toBuffer();
}

export async function applyImageEdit(editType: 'lighting' | 'background' | 'distractions' | 'crop', image: Buffer, cropParams?: CropParams) {
  if (editType === 'lighting') return improveLighting(image);
  if (editType === 'background') return removeBackground(image);
  if (editType === 'distractions') return removeDistractions(image);
  return cropAndResize(image, cropParams);
}
