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
import upload from '@middlewares/upload.js';
import { PRODUCTS_UPLOAD_DIR, PRODUCTS_UPLOAD_URL } from '@configs/config.js';
import authGuard from '@middlewares/auth-guard.js';
import { UserRoles } from '@models/user-model.js';

const router = Router();

router
  .route('/')
  .get(getProductsSchema, validationResult, getProducts)
  .post(
    authGuard({ authenticated: true, roles: [UserRoles.ADMIN, UserRoles.MANAGER] }),
    upload({
      rootPath: PRODUCTS_UPLOAD_DIR,
      rootPrefix: PRODUCTS_UPLOAD_URL,
      stack: [createProductSchema, validationResult, postProduct],
      fields: [
        {
          name: 'images',
          maxCount: 8,
        },
        {
          name: 'imageCover',
          maxCount: 1,
          single: true,
        },
      ],
    }),
  );

router
  .route('/:id')
  .get(productIdParamSchema, validationResult, getSpecificProduct)
  .put(
    authGuard({ authenticated: true, roles: [UserRoles.ADMIN, UserRoles.MANAGER] }),
    upload({
      rootPath: PRODUCTS_UPLOAD_DIR,
      rootPrefix: PRODUCTS_UPLOAD_URL,
      stack: [updateProductSchema, validationResult, putUpdateSpecificProduct],
      fields: [
        {
          name: 'images',
          maxCount: 8,
        },
        {
          name: 'imageCover',
          maxCount: 1,
          single: true,
        },
      ],
    }),
  )
  .delete(
    authGuard({ authenticated: true, roles: [UserRoles.ADMIN] }),
    productIdParamSchema,
    validationResult,
    deleteSpecificProduct,
  );

export default router;
