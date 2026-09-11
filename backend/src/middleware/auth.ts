// Verifies the simple JWT session token and exposes the artisan id to routes.
import type { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthenticatedRequest } from '../types';

const jwtSecret = process.env.JWT_SECRET ?? 'loom-development-secret';

type TokenPayload = { artisanId: string };

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const header = request.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return response.status(401).json({ error: 'Authentication token required' });

  try {
    const payload = jwt.verify(token, jwtSecret) as TokenPayload;
    if (!payload.artisanId) return response.status(401).json({ error: 'Invalid authentication token' });
    request.artisanId = payload.artisanId;
    next();
  } catch {
    return response.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

export function createToken(artisanId: string) {
  return jwt.sign({ artisanId }, jwtSecret, { expiresIn: '7d' });
}
