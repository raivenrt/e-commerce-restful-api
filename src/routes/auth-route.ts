import { Router } from 'express';

import {
  postLogin,
  postSignup,
  patchChangePassword,
  getLoggedUser,
  postLogout,
  postForgotPassword,
  postResetPassword,
  postVerifyResetPassword,
} from '@controllers/auth-controller.js';

import {
  loginSchema,
  signupSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyResetPasswordSchema,
  resetPasswordSchema,
} from '@lib/validators/auth-validators.js';

import validationResult from '@middlewares/validation-result.js';
import authGuard from '@middlewares/auth-guard.js';

const router = Router();

router.get('/', authGuard({ authenticated: true }), getLoggedUser);

router.patch(
  '/change-password',
  authGuard({
    authenticated: true,
  }),
  changePasswordSchema,
  validationResult,
  patchChangePassword,
);

router.post(
  '/signup',
  authGuard({
    authenticated: false,
  }),
  signupSchema,
  validationResult,
  postSignup,
);

router.post(
  '/login',
  authGuard({
    authenticated: false,
  }),
  loginSchema,
  validationResult,
  postLogin,
);

router.post('/logout', authGuard({ authenticated: true }), postLogout);

router.post(
  '/forgot-password',
  forgotPasswordSchema,
  validationResult,
  authGuard({ authenticated: false }),
  postForgotPassword,
);

router.post(
  '/reset-password',
  resetPasswordSchema,
  validationResult,
  authGuard({ authenticated: false }),
  postResetPassword,
);

router.post(
  '/verify-reset-password',
  verifyResetPasswordSchema,
  validationResult,
  authGuard({ authenticated: false }),
  postVerifyResetPassword,
);

export default router;
