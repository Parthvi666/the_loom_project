"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
// Provides email/password registration, login, and the current artisan.
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
exports.authRouter = (0, express_1.Router)();
const publicArtisan = (artisan) => {
    const { passwordHash: _passwordHash, ...safeArtisan } = artisan;
    return safeArtisan;
};
exports.authRouter.post('/register', async (request, response, next) => {
    try {
        const { fullName, email, password } = request.body;
        if (!fullName || !email || !password || password.length < 8)
            return response.status(400).json({ error: 'fullName, email, and a password of at least 8 characters are required' });
        const existing = await db_1.prisma.artisan.findUnique({ where: { email: email.toLowerCase() } });
        if (existing)
            return response.status(409).json({ error: 'An account with that email already exists' });
        const artisan = await db_1.prisma.artisan.create({ data: { fullName, email: email.toLowerCase(), passwordHash: await bcrypt_1.default.hash(password, 12) } });
        response.status(201).json({ token: (0, auth_1.createToken)(artisan.id), artisan: publicArtisan(artisan) });
    }
    catch (error) {
        next(error);
    }
});
exports.authRouter.post('/login', async (request, response, next) => {
    try {
        const { email, password } = request.body;
        const artisan = await db_1.prisma.artisan.findUnique({ where: { email: email?.toLowerCase() } });
        if (!artisan || !password || !(await bcrypt_1.default.compare(password, artisan.passwordHash)))
            return response.status(401).json({ error: 'Invalid email or password' });
        response.json({ token: (0, auth_1.createToken)(artisan.id), artisan: publicArtisan(artisan) });
    }
    catch (error) {
        next(error);
    }
});
exports.authRouter.get('/me', auth_1.requireAuth, async (request, response, next) => {
    try {
        const artisan = await db_1.prisma.artisan.findUnique({ where: { id: request.artisanId } });
        if (!artisan)
            return response.status(404).json({ error: 'Artisan not found' });
        response.json(publicArtisan(artisan));
    }
    catch (error) {
        next(error);
    }
});
