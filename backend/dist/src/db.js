"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// Provides the shared Prisma client for database access.
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
