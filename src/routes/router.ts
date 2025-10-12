import { Router } from 'express';

import categoryRoute from '@routes/category-route.js';
import subCategoryRoute from '@routes/subcategory-route.js';
import brandsRoute from '@routes/brand-route.js';

const router = Router();

// Mount Routes
router.use('/categories', categoryRoute);
router.use('/subcategories', subCategoryRoute);
router.use('/brands', brandsRoute);

export default router;
