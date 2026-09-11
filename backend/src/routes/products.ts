// Product CRUD, uploads, interview storage, publishing, and mock assist routes.
import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { imageUpload } from '../middleware/upload';
import { audioUpload } from '../middleware/audioUpload';
import { analyzeImage } from '../services/imageAnalysis';
import { generateCatalogue } from '../services/catalogueGen';
import { recommendPrice } from '../services/pricing';
import { researchPrice } from '../services/pricingResearch';
import { transcribeWithSarvam } from '../services/sarvamStt';
import { translateText } from '../services/translation';
import { applyImageEdit } from '../services/imageEditing';
import type { AuthenticatedRequest, InterviewAnswer } from '../types';
import { parseJson } from '../types';

export const productsRouter = Router();
const numericFields = ['materialCost', 'labourCost', 'packagingCost', 'otherCosts', 'recommendedPrice', 'finalPrice'];
const serializeProduct = (product: Record<string, unknown>) => ({ ...product, tags: parseJson<string[]>(String(product.tags ?? '[]'), []), images: parseJson<string[]>(String(product.images ?? '[]'), []), interviewAnswers: parseJson<InterviewAnswer[]>(String(product.interviewAnswers ?? '[]'), []) });
const ownedProduct = async (id: string, artisanId: string) => prisma.product.findFirst({ where: { id, artisanId } });

productsRouter.post('/', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = request.body as Record<string, unknown>;
    const data = { artisanId: request.artisanId, name: String(body.name ?? ''), category: String(body.category ?? ''), craft: String(body.craft ?? ''), material: body.material ? String(body.material) : undefined, region: body.region ? String(body.region) : undefined, productionTime: body.productionTime ? String(body.productionTime) : undefined, status: body.status === 'in_progress' ? 'in_progress' : 'draft', ...Object.fromEntries(numericFields.filter(field => body[field] !== undefined).map(field => [field, Number(body[field])])), ...(body.tags ? { tags: JSON.stringify(body.tags) } : {}) };
    if (!data.name || !data.category || !data.craft) return response.status(400).json({ error: 'name, category, and craft are required' });
    response.status(201).json(serializeProduct(await prisma.product.create({ data })));
  } catch (error) { next(error); }
});

productsRouter.get('/', async (request, response, next) => {
  try {
    const products = await prisma.product.findMany({ where: { status: 'published', ...(request.query.category ? { category: String(request.query.category) } : {}), ...(request.query.search ? { OR: [{ name: { contains: String(request.query.search) } }, { craft: { contains: String(request.query.search) } }, { region: { contains: String(request.query.search) } }] } : {}) }, include: { artisan: { select: { id: true, fullName: true, region: true, craft: true, profileImage: true } } }, orderBy: { updatedAt: 'desc' } });
    response.json(products.map((product: Record<string, unknown>) => serializeProduct(product)));
  } catch (error) { next(error); }
});

productsRouter.get('/:id', async (request, response, next) => {
  try { const product = await prisma.product.findUnique({ where: { id: String(request.params.id) }, include: { artisan: { select: { id: true, fullName: true, region: true, craft: true, bio: true, profileImage: true } } } }); if (!product) return response.status(404).json({ error: 'Product not found' }); response.json(serializeProduct(product as unknown as Record<string, unknown>)); } catch (error) { next(error); }
});

productsRouter.put('/:id', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    if (!await ownedProduct(String(request.params.id), request.artisanId)) return response.status(404).json({ error: 'Product not found' });
    const body = request.body as Record<string, unknown>;
    const allowed = ['name', 'category', 'craft', 'material', 'region', 'productionTime', 'descriptionEnglish', 'descriptionHindi', 'status'];
    const data: Record<string, unknown> = Object.fromEntries(allowed.filter(field => body[field] !== undefined).map(field => [field, body[field]]));
    numericFields.forEach(field => { if (body[field] !== undefined) data[field] = Number(body[field]); });
    ['tags', 'images', 'interviewAnswers'].forEach(field => { if (body[field] !== undefined) data[field] = JSON.stringify(body[field]); });
    response.json(serializeProduct(await prisma.product.update({ where: { id: String(request.params.id) }, data })));
  } catch (error) { next(error); }
});

productsRouter.delete('/:id', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try { if (!await ownedProduct(String(request.params.id), request.artisanId)) return response.status(404).json({ error: 'Product not found' }); await prisma.product.delete({ where: { id: String(request.params.id) } }); response.status(204).send(); } catch (error) { next(error); }
});

productsRouter.post('/:id/images', requireAuth, imageUpload.array('images', 10), async (request: AuthenticatedRequest, response, next) => {
  try { const product = await ownedProduct(String(request.params.id), request.artisanId); if (!product) return response.status(404).json({ error: 'Product not found' }); const files = (request.files as Express.Multer.File[] | undefined) ?? []; if (!files.length) return response.status(400).json({ error: 'At least one image is required' }); const images = [...parseJson<string[]>(product.images, []), ...files.map(file => `/uploads/${file.filename}`)]; response.json(serializeProduct(await prisma.product.update({ where: { id: product.id }, data: { images: JSON.stringify(images) } }))); } catch (error) { next(error); }
});

productsRouter.post('/:id/interview-answer', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const product = await ownedProduct(String(request.params.id), request.artisanId);
    if (!product) return response.status(404).json({ error: 'Product not found' });
    const body = request.body as Partial<InterviewAnswer> & { originalAnswer?: string; translatedAnswer?: string; outputLanguage?: string };
    const { question, answer, originalAnswer, translatedAnswer, outputLanguage } = body;
    if (!question || !answer) return response.status(400).json({ error: 'question and answer are required' });
    const answers = [...parseJson<InterviewAnswer[]>(product.interviewAnswers, []), { question, answer, originalAnswer: originalAnswer ?? answer, translatedAnswer: translatedAnswer ?? answer, outputLanguage: outputLanguage ?? 'en' }];
    response.json(serializeProduct(await prisma.product.update({ where: { id: product.id }, data: { interviewAnswers: JSON.stringify(answers), status: 'in_progress' } })));
  } catch (error) { next(error); }
});

productsRouter.post('/:id/translate', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const product = await ownedProduct(String(request.params.id), request.artisanId);
    if (!product) return response.status(404).json({ error: 'Product not found' });
    const { text, targetLanguage, sourceLanguage } = request.body as { text?: string; targetLanguage?: string; sourceLanguage?: string };
    if (!text || !targetLanguage) return response.status(400).json({ error: 'text and targetLanguage are required' });
    const translated = await translateText(String(text), String(targetLanguage));
    response.json({ text: translated || String(text), sourceLanguage: sourceLanguage ?? 'unknown', targetLanguage: String(targetLanguage), fallback: translated === text });
  } catch (error) {
    const fallback = String((request.body as { text?: string })?.text ?? '');
    response.json({ text: fallback, sourceLanguage: 'unknown', targetLanguage: String((request.body as { targetLanguage?: string })?.targetLanguage ?? 'en'), fallback: true });
  }
});

productsRouter.post('/:id/transcribe', requireAuth, audioUpload.single('audio'), async (request: AuthenticatedRequest, response, next) => {
  try {
    if (!await ownedProduct(String(request.params.id), request.artisanId)) return response.status(404).json({ error: 'Product not found' });
    const file = request.file;
    const languageCode = String(request.body.languageCode ?? request.body.language_code ?? 'unknown');
    if (!file) return response.status(400).json({ error: 'An audio recording is required' });
    if (!['unknown', 'gu-IN', 'hi-IN', 'en-IN'].includes(languageCode)) return response.status(400).json({ error: 'languageCode must be unknown, gu-IN, hi-IN, or en-IN' });
    const transcript = await transcribeWithSarvam(file.buffer, file.mimetype, languageCode, file.originalname || 'interview.webm');
    response.json({ transcript });
  } catch (error) {
    console.error(error);
    response.status(502).json({ error: "Couldn't process that recording. Try again, type your answer, or skip this question." });
  }
});

productsRouter.post('/:id/publish', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try { const product = await ownedProduct(String(request.params.id), request.artisanId); if (!product) return response.status(404).json({ error: 'Product not found' }); if (product.finalPrice === null) return response.status(400).json({ error: 'finalPrice must be set before publishing' }); response.json(serializeProduct(await prisma.product.update({ where: { id: product.id }, data: { status: 'published' } }))); } catch (error) { next(error); }
});

productsRouter.post('/:id/analyze-image', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const product = await ownedProduct(String(request.params.id), request.artisanId);
    if (!product) return response.status(404).json({ error: 'Product not found' });
    const imagePath = parseJson<string[]>(product.images, [])[0];
    const imageData = imagePath ? `data:image/${path.extname(imagePath).slice(1) || 'jpeg'};base64,${(await fs.readFile(path.resolve(process.cwd(), imagePath.replace(/^\//, '')))).toString('base64')}` : undefined;
    response.json(await analyzeImage(imageData));
  } catch (error) { next(error); }
});

productsRouter.post('/:id/generate-catalogue', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try { const product = await ownedProduct(String(request.params.id), request.artisanId); if (!product) return response.status(404).json({ error: 'Product not found' }); response.json(await generateCatalogue(product)); } catch (error) { next(error); }
});

productsRouter.post('/:id/edit-image', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const product = await ownedProduct(String(request.params.id), request.artisanId);
    if (!product) return response.status(404).json({ error: 'Product not found' });
    const body = request.body as { editType?: string; imageData?: string; imagePath?: string; cropParams?: Record<string, number> };
    const editType = body.editType;
    if (!['lighting', 'background', 'distractions', 'crop'].includes(String(editType))) return response.status(400).json({ error: 'Unsupported image edit type' });
    const sourcePath = body.imagePath || parseJson<string[]>(product.images, [])[0];
    const image = body.imageData?.startsWith('data:')
      ? Buffer.from(body.imageData.split(',')[1] ?? '', 'base64')
      : sourcePath ? await fs.readFile(path.resolve(process.cwd(), sourcePath.replace(/^\//, ''))) : undefined;
    if (!image?.length) return response.status(400).json({ error: 'An image is required' });
    const edited = await applyImageEdit(editType as 'lighting' | 'background' | 'distractions' | 'crop', image, body.cropParams);
    const filename = `edited-${product.id}-${Date.now()}.png`;
    const uploadDirectory = path.resolve(process.cwd(), 'uploads');
    await fs.mkdir(uploadDirectory, { recursive: true });
    await fs.writeFile(path.join(uploadDirectory, filename), edited);
    const editedPath = `/uploads/${filename}`;
    const images = [...parseJson<string[]>(product.images, []), editedPath];
    await prisma.product.update({ where: { id: product.id }, data: { images: JSON.stringify(images) } });
    response.json({ imagePath: editedPath, originalImagePath: parseJson<string[]>(product.images, [])[0], editType });
  } catch (error) {
    console.error('Image edit failed:', error);
    response.status(502).json({ error: "This edit isn't available right now" });
  }
});

productsRouter.post('/:id/background-remove', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const product = await ownedProduct(String(request.params.id), request.artisanId);
    if (!product) return response.status(404).json({ error: 'Product not found' });
    const { imageUrl } = request.body as { imageUrl?: string };
    if (!imageUrl) return response.status(400).json({ error: 'imageUrl is required' });
    const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.PUBLIC_BASE_URL ?? 'http://localhost:3001'}${imageUrl}`;
    response.json({ outputImageUrl: absoluteImageUrl, error: 'Background removal isn\'t available right now' });
  } catch (error) { next(error); }
});

productsRouter.post('/:id/recommend-price', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const product = await ownedProduct(String(request.params.id), request.artisanId);
    if (!product) return response.status(404).json({ error: 'Product not found' });
    response.json(await researchPrice(product as Record<string, unknown>));
  } catch (error) { next(error); }
});
