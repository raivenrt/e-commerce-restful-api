import { Router } from 'express';

import {
  deleteSpecificReviews,
  getReviews,
  getSpecificReview,
  postReview,
  putUpdateSpecificReview,
} from '@controllers/review-controller.js';

// import {
//   brandIdParamSchema,
//   createBrandSchema,
//   getCategoriesSchema,
//   updateBrandSchema,
// } from '@lib/validators/review-validators.js';

import validationResult from '@middlewares/validation-result.js';
import authGuard from '@middlewares/auth-guard.js';
import { UserRoles } from '@models/user-model.js';

const router = Router();

router
  .route('/')
  .get(getReviews)
  .post(authGuard({ authenticated: true, roles: [UserRoles.USER] }), postReview);

router
  .route('/:id')
  .get(getSpecificReview)
  .put(
    authGuard({ authenticated: true, roles: [UserRoles.USER] }),
    putUpdateSpecificReview,
  )
  .delete(
    authGuard({
      authenticated: true,
      roles: [UserRoles.ADMIN, UserRoles.MANAGER, UserRoles.USER],
    }),
    deleteSpecificReviews,
  );

export default router;
