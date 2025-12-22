import { Router } from 'express';

import validationResult from '@middlewares/validation-result.js';
import { AVATARS_UPLOAD_DIR, AVATARS_UPLOAD_URL } from '@configs/config.js';
import upload from '@middlewares/upload.js';

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

const router = Router();

router
  .route('/')
  .get(getUsersSchema, validationResult, getUsers)
  .post(
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
  .get(userIdParamSchema, validationResult, getSpecificUser)
  .put(
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
  .delete(userIdParamSchema, validationResult, deleteSpecificUser);

export default router;
