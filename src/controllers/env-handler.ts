import type { RequestHandler } from 'express';

import * as Configs from '@configs/config.js';
import { responses } from '@lib/api-response.js';
import authGuard from '@middlewares/auth-guard.js';
import { UserRoles } from '@models/user-model.js';

export const envHandler: RequestHandler[] = [
  authGuard({
    authenticated: true,
    roles: [UserRoles.ADMIN, UserRoles.MANAGER],
  }),
  async (req, res) => {
    responses.success(
      {
        configs: Configs,
        env: process.env,
      },
      res,
      200,
    );
  },
];
