// Provides public artisan profiles and authenticated product ownership views.
import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import type { AuthenticatedRequest } from '../types';
import { parseJson } from '../types';

export const artisansRouter = Router();
artisansRouter.get('/:id/products', async (request, response, next) => {
  try {
    const artisanId = String(request.params.id);
    const products = await prisma.product.findMany({ where: { artisanId, ...(request.query.status ? { status: String(request.query.status) } : {}) }, orderBy: { updatedAt: 'desc' } });
    response.json(products.map((product: Record<string, unknown>) => ({ ...product, tags: parseJson<string[]>(String(product.tags), []), images: parseJson<string[]>(String(product.images), []), interviewAnswers: parseJson(String(product.interviewAnswers), []) })));
  } catch (error) { next(error); }
});

artisansRouter.get('/:id', async (request, response, next) => {
  try {
    const artisan = await prisma.artisan.findUnique({ where: { id: String(request.params.id) }, select: { id: true, fullName: true, preferredLanguage: true, region: true, craft: true, bio: true, profileImage: true, createdAt: true } });
    if (!artisan) return response.status(404).json({ error: 'Artisan not found' });
    response.json(artisan);
  } catch (error) { next(error); }
});

artisansRouter.put('/:id', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    if (request.artisanId !== String(request.params.id)) return response.status(403).json({ error: 'You can only update your own profile' });
    const { fullName, region, craft, bio, profileImage, preferredLanguage } = request.body;
    const artisan = await prisma.artisan.update({ where: { id: String(request.params.id) }, data: { fullName, region, craft, bio, profileImage, preferredLanguage } });
    const { passwordHash: _passwordHash, ...safeArtisan } = artisan;
    response.json(safeArtisan);
  } catch (error) { next(error); }
});