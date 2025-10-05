import { Router } from 'express';

import { getCategories, postCategory } from '@controllers/category-controller.js';

const router = Router();

router.route('/').get(getCategories).post(postCategory);

export default router;
