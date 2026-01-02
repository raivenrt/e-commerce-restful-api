import { Router } from 'express';

import {
  postAddToWishlist,
  deleteProductInWishlist,
  getLoggedUserWishlist,
} from '@controllers/wishlist-controller.js';

import {
  wishlistIdParamSchema,
  addProductToWishlistSchema,
} from '@lib/validators/wishlist-validators.js';

import validationResult from '@middlewares/validation-result.js';
import authGuard from '@middlewares/auth-guard.js';
import { UserRoles } from '@models/user-model.js';

const router = Router();

router.use(authGuard({ authenticated: true, roles: [UserRoles.USER] }));

router
  .route('/')
  .get(getLoggedUserWishlist)
  .post(addProductToWishlistSchema, validationResult, postAddToWishlist);

router
  .route('/:id')
  .delete(wishlistIdParamSchema, validationResult, deleteProductInWishlist);

export default router;
