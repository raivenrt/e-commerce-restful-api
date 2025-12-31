import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import User, { type UserRoles } from '@models/user-model.js';
import { responses } from '@lib/api-response.js';

type AuthGuardOptions =
  | {
      readonly roles?: UserRoles[];
      authenticated: true;
    }
  | {
      authenticated: false;
    };
/**
 * Authentication middleware
 *
 * This middleware checks if the request is authenticated or not.
 * If the request is authenticated and no token is provided, it will throw an error.
 * If the request is not authenticated and a token is provided, it will throw an error.
 * If the request is authenticated and a token is provided, it will verify the token and attach the user to the request.
 * If the request is not authenticated and no token is provided, it will just pass the request to the next middleware.
 *
 * @param {AuthGuardOptions} options - options to guard route
 * @returns {RequestHandler} - middleware to guard route
 */
export default function authGuard(options: AuthGuardOptions): RequestHandler {
  const guard: RequestHandler = async (req, res, next) => {
    let token: string = req.cookies?.jwt || req.headers.authorization;

    try {
      if (!options.authenticated && !token) return next();
      else if (!options.authenticated && token)
        throw new Error('must be unauthenticated');
      else if (options.authenticated && !token) throw new Error('no token provided');

      if (token.startsWith('Bearer ')) token = token.slice(7, token.length);

      const payload = jwt.verify(token, process.env.JWT_SECRET!, {
        issuer: process.env.JWT_ISSUER,
        audience: 'auth',
      }) as jwt.JwtPayload & { id: string };

      const user = await User.findById(payload.id, { password: 0 });

      if (!user) throw new Error('faild to find logged user');

      if (user.passwordChangedAt) {
        const isPasswordChanged =
          user.passwordChangedAt.getTime() - 1000 >= payload.iat! * 1000;
        if (isPasswordChanged)
          throw new Error('password has been changed, please log in again');
      }

      if (options.authenticated && options.roles)
        if (user.role === undefined || !options.roles.includes(user.role))
          throw new Error('you dont have an authorization to access this route');

      req.auth = { token, user };
      next();
    } catch (error: any) {
      responses.failed(
        {
          message:
            error.name === 'JsonWebTokenError'
              ? 'invalid authentiation token format'
              : error.message,
          token,
        },
        res,
        401,
      );
    }
  };

  return guard;
}
