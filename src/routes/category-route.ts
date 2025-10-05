import { Router } from 'express';

import {
  getCategories,
  postCategory,
  getSpecificCategory,
  putUpdateSpecificCategory,
  deleteSpecificCategory,
} from '@controllers/category-controller.js';

const router = Router();

router.route('/').get(getCategories).post(postCategory);

router
  .route('/:id')
  .get(getSpecificCategory)
  .put(putUpdateSpecificCategory)
  .delete(deleteSpecificCategory);

export default router;
