import { Router } from 'express';
import { prisma } from '../db.js';
const router = Router();
// Returns an artisan's products for the artisan profile workflow.
router.get('/:id/products', async (request, response, next) => {
    try {
        const products = await prisma.product.findMany({ where: { artisanId: Number(request.params.id) } });
        response.json(products);
    }
    catch (error) {
        next(error);
    }
});
export default router;
