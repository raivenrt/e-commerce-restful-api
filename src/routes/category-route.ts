import { Router } from 'express';

import subCategoryRoute from '@routes/subcategory-route.js';

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
  nestedRouteCategoryIdSchema,
  updateCategorySchema,
} from '@lib/validators/category-validators.js';
import validationResult from '@middlewares/validation-result.js';

const router = Router();

// Nested Route
router.use(
  '/:categoryId/subcategories',
  nestedRouteCategoryIdSchema,
  validationResult,
  subCategoryRoute,
);

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
