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
import upload from '@middlewares/upload.js';
import { SUBCATEGORY_UPLOAD_DIR, SUBCATEGORY_UPLOAD_URL } from '../configs/config.js';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(getSubCategoriesSchema, validationResult, getSubCategories)
  .post(
    upload({
      rootPath: SUBCATEGORY_UPLOAD_DIR,
      rootPrefix: SUBCATEGORY_UPLOAD_URL,
      stack: [createSubCategorySchema, validationResult, postSubCategory],
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
  .get(subCategoryIdParamSchema, validationResult, getSpecificSubCategory)
  .put(
    upload({
      rootPath: SUBCATEGORY_UPLOAD_DIR,
      rootPrefix: SUBCATEGORY_UPLOAD_URL,
      stack: [updateSubCategorySchema, validationResult, putUpdateSpecificSubCategory],
      fields: [
        {
          name: 'image',
          maxCount: 1,
          single: true,
        },
      ],
    }),
  )
  .delete(subCategoryIdParamSchema, validationResult, deleteSpecificSubCategory);

export default router;
