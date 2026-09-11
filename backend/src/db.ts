// Provides the shared Prisma client for database access.
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();