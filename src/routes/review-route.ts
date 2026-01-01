import { Router } from 'express';

import {
  deleteSpecificReviews,
  filterUserByRoles,
  getReviews,
  getSpecificReview,
  postReview,
  putUpdateSpecificReview,
  swapUserId,
} from '@controllers/review-controller.js';

import {
  createReviewSchema,
  reviewIdParamSchema,
  updateReviewSchema,
} from '@lib/validators/review-validators.js';

import validationResult from '@middlewares/validation-result.js';
import authGuard from '@middlewares/auth-guard.js';
import { UserRoles } from '@models/user-model.js';

const router = Router();

router
  .route('/')
  .get(getReviews)
  .post(
    authGuard({ authenticated: true, roles: [UserRoles.USER] }),
    swapUserId,
    createReviewSchema,
    validationResult,
    postReview,
  );

router
  .route('/:id')
  .get(reviewIdParamSchema, validationResult, getSpecificReview)
  .put(
    authGuard({ authenticated: true, roles: [UserRoles.USER] }),
    swapUserId,
    filterUserByRoles,
    updateReviewSchema,
    validationResult,
    putUpdateSpecificReview,
  )
  .delete(
    authGuard({
      authenticated: true,
      roles: [UserRoles.ADMIN, UserRoles.MANAGER, UserRoles.USER],
    }),
    filterUserByRoles,
    reviewIdParamSchema,
    validationResult,
    deleteSpecificReviews,
  );

export default router;
