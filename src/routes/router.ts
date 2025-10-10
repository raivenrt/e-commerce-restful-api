import { Router } from 'express';

import categoryRoute from '@routes/category-route.js';
import subCategoryRoute from '@routes/subcategory-route.js';

const router = Router();

// Mount Routes
router.use('/categories', categoryRoute);
router.use('/subcategories', subCategoryRoute);

export default router;
