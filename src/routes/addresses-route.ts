import { Router } from 'express';

import {
  deleteUserAddress,
  postAddAddress,
  getLoggedUserAddresses,
  getSpecificUserAddress,
} from '@controllers/addresses-controller.js';

import {
  addressIdParamSchema,
  createAddressSchema,
  updateAddressSchema,
} from '@lib/validators/addresses-validator.js';

import validationResult from '@middlewares/validation-result.js';
import authGuard from '@middlewares/auth-guard.js';
import { UserRoles } from '@models/user-model.js';

const router = Router();

router.use(authGuard({ authenticated: true, roles: [UserRoles.USER] }));

router
  .route('/')
  .get(getLoggedUserAddresses)
  .post(createAddressSchema, validationResult, postAddAddress);

router
  .route('/:id')
  .get(addressIdParamSchema, validationResult, getSpecificUserAddress)
  .delete(addressIdParamSchema, validationResult, deleteUserAddress);

export default router;
