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
  nestedRouteCategoryIdSchema,
  updateCategorySchema,
} from '@lib/validators/category-validators.js';

import subCategoryRoute from '@routes/subcategory-route.js';
import validationResult from '@middlewares/validation-result.js';
import { CATEGORY_UPLOAD_DIR, CATEGORY_UPLOAD_URL } from '@configs/config.js';
import upload from '@middlewares/upload.js';
import { UserRoles } from '@models/user-model.js';
import authGuard from '@middlewares/auth-guard.js';

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
    authGuard({ authenticated: true, roles: [UserRoles.ADMIN, UserRoles.MANAGER] }),
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
    authGuard({ authenticated: true, roles: [UserRoles.ADMIN, UserRoles.MANAGER] }),
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
  .delete(
    authGuard({ authenticated: true, roles: [UserRoles.ADMIN] }),
    categoryIdParamSchema,
    validationResult,
    deleteSpecificCategory,
  );

export default router;
