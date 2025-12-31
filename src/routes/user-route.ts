import { Router } from 'express';

import validationResult from '@middlewares/validation-result.js';
import { AVATARS_UPLOAD_DIR, AVATARS_UPLOAD_URL } from '@configs/config.js';
import upload from '@middlewares/upload.js';
import authGuard from '@middlewares/auth-guard.js';

import {
  deleteSpecificUser,
  getSpecificUser,
  getUsers,
  postCreateUser,
  putUpdateSpecificUser,
} from '@controllers/user-controller.js';

import {
  createUserSchema,
  getUsersSchema,
  updateUserSchema,
  userIdParamSchema,
} from '@lib/validators/user-validators.js';

import { UserRoles } from '@models/user-model.js';

const router = Router();

router
  .route('/')
  .get(
    authGuard({ authenticated: true, roles: [UserRoles.ADMIN] }),
    getUsersSchema,
    validationResult,
    getUsers,
  )
  .post(
    authGuard({ authenticated: true, roles: [UserRoles.MANAGER, UserRoles.ADMIN] }),
    upload({
      rootPath: AVATARS_UPLOAD_DIR,
      rootPrefix: AVATARS_UPLOAD_URL,
      stack: [createUserSchema, validationResult, postCreateUser],
      fields: [
        {
          name: 'avatar',
          maxCount: 1,
          single: true,
        },
      ],
    }),
  );

router
  .route('/:id')
  .get(
    authGuard({ authenticated: true, roles: [UserRoles.ADMIN] }),
    userIdParamSchema,
    validationResult,
    getSpecificUser,
  )
  .put(
    authGuard({ authenticated: true, roles: [UserRoles.ADMIN] }),
    upload({
      rootPath: AVATARS_UPLOAD_DIR,
      rootPrefix: AVATARS_UPLOAD_URL,
      stack: [updateUserSchema, validationResult, putUpdateSpecificUser],
      fields: [
        {
          name: 'avatar',
          maxCount: 1,
          single: true,
        },
      ],
    }),
  )
  .delete(
    authGuard({ authenticated: true, roles: [UserRoles.ADMIN] }),
    userIdParamSchema,
    validationResult,
    deleteSpecificUser,
  );

export default router;
