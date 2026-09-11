import { Router } from 'express';
import { prisma } from '../db.js';
import { analyzeImage } from '../services/imageAnalysis.js';
import { generateCatalogue } from '../services/catalogueGen.js';
import { recommendPrice } from '../services/pricing.js';
import { callAi } from '../services/aiClient.js';
const router = Router();
// Creates a draft product using the submitted product fields.
router.post('/', async (request, response, next) => {
    try {
        const product = await prisma.product.create({ data: { ...request.body, artisanId: Number(request.body.artisanId ?? 1) } });
        response.status(201).json(product);
    }
    catch (error) {
        next(error);
    }
});
// Runs placeholder image analysis.
router.post('/analyze-image', async (request, response, next) => {
    try {
        response.json({ result: await analyzeImage(String(request.body.input ?? '')) });
    }
    catch (error) {
        next(error);
    }
});
// Runs placeholder speech-to-text handling.
router.post('/speech-to-text', async (request, response, next) => {
    try {
        response.json({ text: await callAi(`Transcribe speech: ${String(request.body.input ?? '')}`) });
    }
    catch (error) {
        next(error);
    }
});
// Runs placeholder catalogue generation.
router.post('/generate-catalogue', async (request, response, next) => {
    try {
        response.json({ result: await generateCatalogue(JSON.stringify(request.body)) });
    }
    catch (error) {
        next(error);
    }
});
// Runs placeholder pricing recommendation.
router.post('/recommend-price', async (request, response, next) => {
    try {
        response.json({ result: await recommendPrice(JSON.stringify(request.body)) });
    }
    catch (error) {
        next(error);
    }
});
// Updates a product draft.
router.put('/:id', async (request, response, next) => {
    try {
        response.json(await prisma.product.update({ where: { id: Number(request.params.id) }, data: request.body }));
    }
    catch (error) {
        next(error);
    }
});
// Marks a product as published.
router.post('/:id/publish', async (request, response, next) => {
    try {
        response.json(await prisma.product.update({ where: { id: Number(request.params.id) }, data: { status: 'published' } }));
    }
    catch (error) {
        next(error);
    }
});
// Lists products, optionally filtered by artisan.
router.get('/', async (request, response, next) => {
    try {
        response.json(await prisma.product.findMany({ where: request.query.artisanId ? { artisanId: Number(request.query.artisanId) } : undefined }));
    }
    catch (error) {
        next(error);
    }
});
export default router;
