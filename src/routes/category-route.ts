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
import { CATEGORY_UPLOAD_DIR, CATEGORY_UPLOAD_URL } from '@configs/config.js';
import imgOptimizer from '@base/src/middlewares/upload.js';
import upload from '@middlewares/upload.js';

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
  .post(
    upload({
      rootPath: CATEGORY_UPLOAD_DIR,
      rootPrefix: CATEGORY_UPLOAD_URL,
      stack: [createCategorySchema, validationResult, postCategory],
      fields: [
        {
          name: 'image',
          maxCount: 1,
          single: true,
        },
      ],
    }),
  );

router
  .route('/:id')
  .get(categoryIdParamSchema, validationResult, getSpecificCategory)
  .put(
    upload({
      rootPath: CATEGORY_UPLOAD_DIR,
      rootPrefix: CATEGORY_UPLOAD_URL,
      stack: [updateCategorySchema, validationResult, putUpdateSpecificCategory],
      fields: [
        {
          name: 'image',
          maxCount: 1,
          single: true,
        },
      ],
    }),
  )
  .delete(categoryIdParamSchema, validationResult, deleteSpecificCategory);

export default router;
