"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRouter = void 0;
// Product CRUD, uploads, interview storage, publishing, and mock assist routes.
const express_1 = require("express");
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const audioUpload_1 = require("../middleware/audioUpload");
const imageAnalysis_1 = require("../services/imageAnalysis");
const catalogueGen_1 = require("../services/catalogueGen");
const pricingResearch_1 = require("../services/pricingResearch");
const sarvamStt_1 = require("../services/sarvamStt");
const translation_1 = require("../services/translation");
const imageEditing_1 = require("../services/imageEditing");
const types_1 = require("../types");
exports.productsRouter = (0, express_1.Router)();
const numericFields = ['materialCost', 'labourCost', 'packagingCost', 'otherCosts', 'recommendedPrice', 'finalPrice'];
const serializeProduct = (product) => ({ ...product, tags: (0, types_1.parseJson)(String(product.tags ?? '[]'), []), images: (0, types_1.parseJson)(String(product.images ?? '[]'), []), interviewAnswers: (0, types_1.parseJson)(String(product.interviewAnswers ?? '[]'), []) });
const ownedProduct = async (id, artisanId) => db_1.prisma.product.findFirst({ where: { id, artisanId } });
exports.productsRouter.post('/', auth_1.requireAuth, async (request, response, next) => {
    try {
        const body = request.body;
        const data = { artisanId: request.artisanId, name: String(body.name ?? ''), category: String(body.category ?? ''), craft: String(body.craft ?? ''), material: body.material ? String(body.material) : undefined, region: body.region ? String(body.region) : undefined, productionTime: body.productionTime ? String(body.productionTime) : undefined, status: body.status === 'in_progress' ? 'in_progress' : 'draft', ...Object.fromEntries(numericFields.filter(field => body[field] !== undefined).map(field => [field, Number(body[field])])), ...(body.tags ? { tags: JSON.stringify(body.tags) } : {}) };
        if (!data.name || !data.category || !data.craft)
            return response.status(400).json({ error: 'name, category, and craft are required' });
        response.status(201).json(serializeProduct(await db_1.prisma.product.create({ data })));
    }
    catch (error) {
        next(error);
    }
});
exports.productsRouter.get('/', async (request, response, next) => {
    try {
        const products = await db_1.prisma.product.findMany({ where: { status: 'published', ...(request.query.category ? { category: String(request.query.category) } : {}), ...(request.query.search ? { OR: [{ name: { contains: String(request.query.search) } }, { craft: { contains: String(request.query.search) } }, { region: { contains: String(request.query.search) } }] } : {}) }, include: { artisan: { select: { id: true, fullName: true, region: true, craft: true, profileImage: true } } }, orderBy: { updatedAt: 'desc' } });
        response.json(products.map((product) => serializeProduct(product)));
    }
    catch (error) {
        next(error);
    }
});
exports.productsRouter.get('/:id', async (request, response, next) => {
    try {
        const product = await db_1.prisma.product.findUnique({ where: { id: String(request.params.id) }, include: { artisan: { select: { id: true, fullName: true, region: true, craft: true, bio: true, profileImage: true } } } });
        if (!product)
            return response.status(404).json({ error: 'Product not found' });
        response.json(serializeProduct(product));
    }
    catch (error) {
        next(error);
    }
});
exports.productsRouter.put('/:id', auth_1.requireAuth, async (request, response, next) => {
    try {
        if (!await ownedProduct(String(request.params.id), request.artisanId))
            return response.status(404).json({ error: 'Product not found' });
        const body = request.body;
        const allowed = ['name', 'category', 'craft', 'material', 'region', 'productionTime', 'descriptionEnglish', 'descriptionHindi', 'status'];
        const data = Object.fromEntries(allowed.filter(field => body[field] !== undefined).map(field => [field, body[field]]));
        numericFields.forEach(field => { if (body[field] !== undefined)
            data[field] = Number(body[field]); });
        ['tags', 'images', 'interviewAnswers'].forEach(field => { if (body[field] !== undefined)
            data[field] = JSON.stringify(body[field]); });
        response.json(serializeProduct(await db_1.prisma.product.update({ where: { id: String(request.params.id) }, data })));
    }
    catch (error) {
        next(error);
    }
});
exports.productsRouter.delete('/:id', auth_1.requireAuth, async (request, response, next) => {
    try {
        if (!await ownedProduct(String(request.params.id), request.artisanId))
            return response.status(404).json({ error: 'Product not found' });
        await db_1.prisma.product.delete({ where: { id: String(request.params.id) } });
        response.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.productsRouter.post('/:id/images', auth_1.requireAuth, upload_1.imageUpload.array('images', 10), async (request, response, next) => {
    try {
        const product = await ownedProduct(String(request.params.id), request.artisanId);
        if (!product)
            return response.status(404).json({ error: 'Product not found' });
        const files = request.files ?? [];
        if (!files.length)
            return response.status(400).json({ error: 'At least one image is required' });
        const images = [...(0, types_1.parseJson)(product.images, []), ...files.map(file => `/uploads/${file.filename}`)];
        response.json(serializeProduct(await db_1.prisma.product.update({ where: { id: product.id }, data: { images: JSON.stringify(images) } })));
    }
    catch (error) {
        next(error);
    }
});
exports.productsRouter.post('/:id/interview-answer', auth_1.requireAuth, async (request, response, next) => {
    try {
        const product = await ownedProduct(String(request.params.id), request.artisanId);
        if (!product)
            return response.status(404).json({ error: 'Product not found' });
        const body = request.body;
        const { question, answer, originalAnswer, translatedAnswer, outputLanguage } = body;
        if (!question || !answer)
            return response.status(400).json({ error: 'question and answer are required' });
        const answers = [...(0, types_1.parseJson)(product.interviewAnswers, []), { question, answer, originalAnswer: originalAnswer ?? answer, translatedAnswer: translatedAnswer ?? answer, outputLanguage: outputLanguage ?? 'en' }];
        response.json(serializeProduct(await db_1.prisma.product.update({ where: { id: product.id }, data: { interviewAnswers: JSON.stringify(answers), status: 'in_progress' } })));
    }
    catch (error) {
        next(error);
    }
});
exports.productsRouter.post('/:id/translate', auth_1.requireAuth, async (request, response, next) => {
    try {
        const product = await ownedProduct(String(request.params.id), request.artisanId);
        if (!product)
            return response.status(404).json({ error: 'Product not found' });
        const { text, targetLanguage, sourceLanguage } = request.body;
        if (!text || !targetLanguage)
            return response.status(400).json({ error: 'text and targetLanguage are required' });
        const translated = await (0, translation_1.translateText)(String(text), String(targetLanguage));
        response.json({ text: translated || String(text), sourceLanguage: sourceLanguage ?? 'unknown', targetLanguage: String(targetLanguage), fallback: translated === text });
    }
    catch (error) {
        const fallback = String(request.body?.text ?? '');
        response.json({ text: fallback, sourceLanguage: 'unknown', targetLanguage: String(request.body?.targetLanguage ?? 'en'), fallback: true });
    }
});
exports.productsRouter.post('/:id/transcribe', auth_1.requireAuth, audioUpload_1.audioUpload.single('audio'), async (request, response, next) => {
    try {
        if (!await ownedProduct(String(request.params.id), request.artisanId))
            return response.status(404).json({ error: 'Product not found' });
        const file = request.file;
        const languageCode = String(request.body.languageCode ?? request.body.language_code ?? 'unknown');
        if (!file)
            return response.status(400).json({ error: 'An audio recording is required' });
        if (!['unknown', 'gu-IN', 'hi-IN', 'en-IN'].includes(languageCode))
            return response.status(400).json({ error: 'languageCode must be unknown, gu-IN, hi-IN, or en-IN' });
        const transcript = await (0, sarvamStt_1.transcribeWithSarvam)(file.buffer, file.mimetype, languageCode, file.originalname || 'interview.webm');
        response.json({ transcript });
    }
    catch (error) {
        console.error(error);
        response.status(502).json({ error: "Couldn't process that recording. Try again, type your answer, or skip this question." });
    }
});
exports.productsRouter.post('/:id/publish', auth_1.requireAuth, async (request, response, next) => {
    try {
        const product = await ownedProduct(String(request.params.id), request.artisanId);
        if (!product)
            return response.status(404).json({ error: 'Product not found' });
        if (product.finalPrice === null)
            return response.status(400).json({ error: 'finalPrice must be set before publishing' });
        response.json(serializeProduct(await db_1.prisma.product.update({ where: { id: product.id }, data: { status: 'published' } })));
    }
    catch (error) {
        next(error);
    }
});
exports.productsRouter.post('/:id/analyze-image', auth_1.requireAuth, async (request, response, next) => {
    try {
        const product = await ownedProduct(String(request.params.id), request.artisanId);
        if (!product)
            return response.status(404).json({ error: 'Product not found' });
        const imagePath = (0, types_1.parseJson)(product.images, [])[0];
        const imageData = imagePath ? `data:image/${node_path_1.default.extname(imagePath).slice(1) || 'jpeg'};base64,${(await promises_1.default.readFile(node_path_1.default.resolve(process.cwd(), imagePath.replace(/^\//, '')))).toString('base64')}` : undefined;
        response.json(await (0, imageAnalysis_1.analyzeImage)(imageData));
    }
    catch (error) {
        next(error);
    }
});
exports.productsRouter.post('/:id/generate-catalogue', auth_1.requireAuth, async (request, response, next) => {
    try {
        const product = await ownedProduct(String(request.params.id), request.artisanId);
        if (!product)
            return response.status(404).json({ error: 'Product not found' });
        response.json(await (0, catalogueGen_1.generateCatalogue)(product));
    }
    catch (error) {
        next(error);
    }
});
exports.productsRouter.post('/:id/edit-image', auth_1.requireAuth, async (request, response, next) => {
    try {
        const product = await ownedProduct(String(request.params.id), request.artisanId);
        if (!product)
            return response.status(404).json({ error: 'Product not found' });
        const body = request.body;
        const editType = body.editType;
        if (!['lighting', 'background', 'distractions', 'crop'].includes(String(editType)))
            return response.status(400).json({ error: 'Unsupported image edit type' });
        const sourcePath = body.imagePath || (0, types_1.parseJson)(product.images, [])[0];
        const image = body.imageData?.startsWith('data:')
            ? Buffer.from(body.imageData.split(',')[1] ?? '', 'base64')
            : sourcePath ? await promises_1.default.readFile(node_path_1.default.resolve(process.cwd(), sourcePath.replace(/^\//, ''))) : undefined;
        if (!image?.length)
            return response.status(400).json({ error: 'An image is required' });
        const edited = await (0, imageEditing_1.applyImageEdit)(editType, image, body.cropParams);
        const filename = `edited-${product.id}-${Date.now()}.png`;
        const uploadDirectory = node_path_1.default.resolve(process.cwd(), 'uploads');
        await promises_1.default.mkdir(uploadDirectory, { recursive: true });
        await promises_1.default.writeFile(node_path_1.default.join(uploadDirectory, filename), edited);
        const editedPath = `/uploads/${filename}`;
        const images = [...(0, types_1.parseJson)(product.images, []), editedPath];
        await db_1.prisma.product.update({ where: { id: product.id }, data: { images: JSON.stringify(images) } });
        response.json({ imagePath: editedPath, originalImagePath: (0, types_1.parseJson)(product.images, [])[0], editType });
    }
    catch (error) {
        console.error('Image edit failed:', error);
        response.status(502).json({ error: "This edit isn't available right now" });
    }
});
exports.productsRouter.post('/:id/background-remove', auth_1.requireAuth, async (request, response, next) => {
    try {
        const product = await ownedProduct(String(request.params.id), request.artisanId);
        if (!product)
            return response.status(404).json({ error: 'Product not found' });
        const { imageUrl } = request.body;
        if (!imageUrl)
            return response.status(400).json({ error: 'imageUrl is required' });
        const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.PUBLIC_BASE_URL ?? 'http://localhost:3001'}${imageUrl}`;
        response.json({ outputImageUrl: absoluteImageUrl, error: 'Background removal isn\'t available right now' });
    }
    catch (error) {
        next(error);
    }
});
exports.productsRouter.post('/:id/recommend-price', auth_1.requireAuth, async (request, response, next) => {
    try {
        const product = await ownedProduct(String(request.params.id), request.artisanId);
        if (!product)
            return response.status(404).json({ error: 'Product not found' });
        response.json(await (0, pricingResearch_1.researchPrice)(product));
    }
    catch (error) {
        next(error);
    }
});
