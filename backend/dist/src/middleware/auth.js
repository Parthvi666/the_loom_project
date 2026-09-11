"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.createToken = createToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtSecret = process.env.JWT_SECRET ?? 'loom-development-secret';
function requireAuth(request, response, next) {
    const header = request.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token)
        return response.status(401).json({ error: 'Authentication token required' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (!payload.artisanId)
            return response.status(401).json({ error: 'Invalid authentication token' });
        request.artisanId = payload.artisanId;
        next();
    }
    catch {
        return response.status(401).json({ error: 'Invalid or expired authentication token' });
    }
}
function createToken(artisanId) {
    return jsonwebtoken_1.default.sign({ artisanId }, jwtSecret, { expiresIn: '7d' });
}
