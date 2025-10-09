import { Router } from 'express';

import {
  getCategories,
  postCategory,
  getSpecificCategory,
  putUpdateSpecificCategory,
  deleteSpecificCategory,
} from '@controllers/category-controller.js';
import {
  categoryIdParamSchema,
  createCategorySchema,
  getCategoriesSchema,
  updateCategorySchema,
} from '@lib/validators/category-validators.js';
import validationResult from '@middlewares/validation-result.js';

const router = Router();

router
  .route('/')
  .get(getCategoriesSchema, validationResult, getCategories)
  .post(createCategorySchema, validationResult, postCategory);

router
  .route('/:id')
  .get(categoryIdParamSchema, validationResult, getSpecificCategory)
  .put(updateCategorySchema, validationResult, putUpdateSpecificCategory)
  .delete(categoryIdParamSchema, validationResult, deleteSpecificCategory);

export default router;
