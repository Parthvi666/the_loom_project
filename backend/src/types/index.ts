// Shared request and response types used across the API.
import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      artisanId: string;
    }
  }
}

export type Language = 'gu' | 'hi' | 'en';
export type ProductStatus = 'draft' | 'in_progress' | 'published';

export type AuthenticatedRequest = Request;

export type InterviewAnswer = {
  question: string;
  answer: string;
};

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
