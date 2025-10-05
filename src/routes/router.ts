import { Router } from 'express';

import categoryRoute from '@routes/category-route.js';

const router = Router();

// Mount Routes
router.use('/categories', categoryRoute);

export default router;
