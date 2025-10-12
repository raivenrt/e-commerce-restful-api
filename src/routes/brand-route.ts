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

const router = Router();

router
  .route('/')
  .get(getCategoriesSchema, validationResult, getBrands)
  .post(createBrandSchema, validationResult, postBrand);

router
  .route('/:id')
  .get(brandIdParamSchema, validationResult, getSpecificBrand)
  .put(updateBrandSchema, validationResult, putUpdateSpecificBrand)
  .delete(brandIdParamSchema, validationResult, deleteSpecificBrand);

export default router;
