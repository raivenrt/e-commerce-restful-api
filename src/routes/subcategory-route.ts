import { Router } from 'express';

import {
  getSubCategories,
  deleteSpecificSubCategory,
  getSpecificSubCategory,
  postSubCategory,
  putUpdateSpecificSubCategory,
} from '@controllers/subcategory-controller.js';

import {
  createSubCategorySchema,
  getSubCategoriesSchema,
  subCategoryIdParamSchema,
  updateSubCategorySchema,
} from '@lib/validators/subcategory-validators.js';

import validationResult from '@middlewares/validation-result.js';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(getSubCategoriesSchema, validationResult, getSubCategories)
  .post(createSubCategorySchema, validationResult, postSubCategory);

router
  .route('/:id')
  .get(subCategoryIdParamSchema, validationResult, getSpecificSubCategory)
  .put(updateSubCategorySchema, validationResult, putUpdateSpecificSubCategory)
  .delete(subCategoryIdParamSchema, validationResult, deleteSpecificSubCategory);

export default router;
