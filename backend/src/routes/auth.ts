// Provides email/password registration, login, and the current artisan.
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../db';
import { createToken, requireAuth } from '../middleware/auth';
import type { AuthenticatedRequest } from '../types';

export const authRouter = Router();

const publicArtisan = (artisan: { passwordHash: string; [key: string]: unknown }) => {
	const { passwordHash: _passwordHash, ...safeArtisan } = artisan;
	return safeArtisan;
};

authRouter.post('/register', async (request, response, next) => {
	try {
		const { fullName, email, password } = request.body as Record<string, string>;
		if (!fullName || !email || !password || password.length < 8) return response.status(400).json({ error: 'fullName, email, and a password of at least 8 characters are required' });
		const existing = await prisma.artisan.findUnique({ where: { email: email.toLowerCase() } });
		if (existing) return response.status(409).json({ error: 'An account with that email already exists' });
		const artisan = await prisma.artisan.create({ data: { fullName, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12) } });
		response.status(201).json({ token: createToken(artisan.id), artisan: publicArtisan(artisan) });
	} catch (error) { next(error); }
});

authRouter.post('/login', async (request, response, next) => {
	try {
		const { email, password } = request.body as Record<string, string>;
		const artisan = await prisma.artisan.findUnique({ where: { email: email?.toLowerCase() } });
		if (!artisan || !password || !(await bcrypt.compare(password, artisan.passwordHash))) return response.status(401).json({ error: 'Invalid email or password' });
		response.json({ token: createToken(artisan.id), artisan: publicArtisan(artisan) });
	} catch (error) { next(error); }
});

authRouter.get('/me', requireAuth, async (request: AuthenticatedRequest, response, next) => {
	try {
		const artisan = await prisma.artisan.findUnique({ where: { id: request.artisanId } });
		if (!artisan) return response.status(404).json({ error: 'Artisan not found' });
		response.json(publicArtisan(artisan));
	} catch (error) { next(error); }
});