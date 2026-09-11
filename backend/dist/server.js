import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import artisanRoutes from './routes/artisans.js';
import { errorHandler } from './middleware/errorHandler.js';
const app = express();
const port = Number(process.env.PORT ?? 3001);
// Configures the Express API and registers its route groups.
app.use(cors());
app.use(express.json());
app.get('/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/artisans', artisanRoutes);
app.use(errorHandler);
app.listen(port, () => console.log(`The Loom API listening on port ${port}`));
