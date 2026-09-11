"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Starts the Express API and mounts all application routes.
require("dotenv/config");
const node_path_1 = __importDefault(require("node:path"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("./routes/auth");
const products_1 = require("./routes/products");
const artisans_1 = require("./routes/artisans");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(node_path_1.default.resolve(process.cwd(), 'uploads')));
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/auth', auth_1.authRouter);
app.use('/api/products', products_1.productsRouter);
app.use('/api/artisans', artisans_1.artisansRouter);
app.use(errorHandler_1.errorHandler);
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
