import { Router } from 'express';

import categoryRoute from '@routes/category-route.js';
import subCategoryRoute from '@routes/subcategory-route.js';
import brandsRoute from '@routes/brand-route.js';
import productsRoute from '@routes/product-route.js';
import usersRoute from '@routes/user-route.js';
import authRoute from '@routes/auth-route.js';
import reviewRoute from '@routes/review-route.js';
import wishlistRoute from '@routes/wishlist-route.js';
import addressesRoute from '@routes/addresses-route.js';

const router = Router();

// Mount Routes
router.use('/categories', categoryRoute);
router.use('/subcategories', subCategoryRoute);
router.use('/brands', brandsRoute);
router.use('/products', productsRoute);
router.use('/users', usersRoute);
router.use('/auth', authRoute);
router.use('/reviews', reviewRoute);
router.use('/wishlist', wishlistRoute);
router.use('/addresses', addressesRoute);

export default router;
