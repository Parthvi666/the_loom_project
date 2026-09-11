// Starts the Express API and mounts all application routes.
import 'dotenv/config';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import { authRouter } from './routes/auth';
import { productsRouter } from './routes/products';
import { artisansRouter } from './routes/artisans';
import { errorHandler } from './middleware/errorHandler';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/artisans', artisansRouter);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));