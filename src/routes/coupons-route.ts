import { Router } from 'express';

import {
  deleteSpecificCoupon,
  getSpecificCoupon,
  getCoupons,
  postCreateCoupon,
  putUpdateSpecificCoupon,
} from '@controllers/coupon-controller.js';

import {
  createCouponSchema,
  couponIdParamSchema,
  updateCouponSchema,
} from '@lib/validators/coupon-validator.js';

import validationResult from '@middlewares/validation-result.js';
import authGuard from '@middlewares/auth-guard.js';
import { UserRoles } from '@models/user-model.js';

const router = Router();

router.use(
  authGuard({ authenticated: true, roles: [UserRoles.ADMIN, UserRoles.MANAGER] }),
);

router
  .route('/')
  .get(getCoupons)
  .post(createCouponSchema, validationResult, postCreateCoupon);

router
  .route('/:id')
  .get(couponIdParamSchema, validationResult, getSpecificCoupon)
  .put(updateCouponSchema, validationResult, putUpdateSpecificCoupon)
  .delete(couponIdParamSchema, validationResult, deleteSpecificCoupon);

export default router;
