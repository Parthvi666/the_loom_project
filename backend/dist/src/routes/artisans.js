"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artisansRouter = void 0;
// Provides public artisan profiles and authenticated product ownership views.
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
exports.artisansRouter = (0, express_1.Router)();
exports.artisansRouter.get('/:id/products', async (request, response, next) => {
    try {
        const artisanId = String(request.params.id);
        const products = await db_1.prisma.product.findMany({ where: { artisanId, ...(request.query.status ? { status: String(request.query.status) } : {}) }, orderBy: { updatedAt: 'desc' } });
        response.json(products.map((product) => ({ ...product, tags: (0, types_1.parseJson)(String(product.tags), []), images: (0, types_1.parseJson)(String(product.images), []), interviewAnswers: (0, types_1.parseJson)(String(product.interviewAnswers), []) })));
    }
    catch (error) {
        next(error);
    }
});
exports.artisansRouter.get('/:id', async (request, response, next) => {
    try {
        const artisan = await db_1.prisma.artisan.findUnique({ where: { id: String(request.params.id) }, select: { id: true, fullName: true, preferredLanguage: true, region: true, craft: true, bio: true, profileImage: true, createdAt: true } });
        if (!artisan)
            return response.status(404).json({ error: 'Artisan not found' });
        response.json(artisan);
    }
    catch (error) {
        next(error);
    }
});
exports.artisansRouter.put('/:id', auth_1.requireAuth, async (request, response, next) => {
    try {
        if (request.artisanId !== String(request.params.id))
            return response.status(403).json({ error: 'You can only update your own profile' });
        const { fullName, region, craft, bio, profileImage, preferredLanguage } = request.body;
        const artisan = await db_1.prisma.artisan.update({ where: { id: String(request.params.id) }, data: { fullName, region, craft, bio, profileImage, preferredLanguage } });
        const { passwordHash: _passwordHash, ...safeArtisan } = artisan;
        response.json(safeArtisan);
    }
    catch (error) {
        next(error);
    }
});
