import { Router } from 'express';

import {
  deleteSpecificProduct,
  getProducts,
  getSpecificProduct,
  postProduct,
  putUpdateSpecificProduct,
} from '@controllers/product-controller.js';

import {
  productIdParamSchema,
  createProductSchema,
  getProductsSchema,
  updateProductSchema,
} from '@lib/validators/product-validators.js';

import validationResult from '@middlewares/validation-result.js';

const router = Router();

router
  .route('/')
  .get(getProductsSchema, validationResult, getProducts)
  .post(createProductSchema, validationResult, postProduct);

router
  .route('/:id')
  .get(productIdParamSchema, validationResult, getSpecificProduct)
  .put(updateProductSchema, validationResult, putUpdateSpecificProduct)
  .delete(productIdParamSchema, validationResult, deleteSpecificProduct);

export default router;
