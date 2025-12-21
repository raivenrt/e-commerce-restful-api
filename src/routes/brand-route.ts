import { Router } from 'express';

import {
  deleteSpecificBrand,
  getBrands,
  getSpecificBrand,
  postBrand,
  putUpdateSpecificBrand,
} from '@controllers/brand-controller.js';

import {
  brandIdParamSchema,
  createBrandSchema,
  getCategoriesSchema,
  updateBrandSchema,
} from '@lib/validators/brand-validators.js';

import validationResult from '@middlewares/validation-result.js';
import { BRAND_UPLOAD_DIR, BRAND_UPLOAD_URL } from '@configs/config.js';
import upload from '@middlewares/upload.js';

const router = Router();

router
  .route('/')
  .get(getCategoriesSchema, validationResult, getBrands)
  .post(
    upload({
      rootPath: BRAND_UPLOAD_DIR,
      rootPrefix: BRAND_UPLOAD_URL,
      stack: [createBrandSchema, validationResult, postBrand],
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
  .get(brandIdParamSchema, validationResult, getSpecificBrand)
  .put(
    upload({
      rootPath: BRAND_UPLOAD_DIR,
      rootPrefix: BRAND_UPLOAD_URL,
      stack: [updateBrandSchema, validationResult, putUpdateSpecificBrand],
      fields: [
        {
          name: 'image',
          maxCount: 1,
          single: true,
        },
      ],
    }),
  )
  .delete(brandIdParamSchema, validationResult, deleteSpecificBrand);

export default router;
