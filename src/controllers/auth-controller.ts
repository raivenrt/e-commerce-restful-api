import crypto from 'crypto';

import type { RequestHandler, Request, Response } from 'express';
import useragent from 'useragent';

import { responses } from '@lib/api-response.js';
import generateResetToken from '@lib/generate-reset-token.js';
import sendEmail from '@lib/emails/send-email.js';
import User from '@models/user-model.js';
import Token from '@models/token-model.js';

async function verifyResetPasswordService(req: Request, res: Response) {
  const { token: plainToken } = req.query;
  const { otp, requestId } = req.body;

  if (!otp && !requestId) throw new Error('no reset password request metadata provided');

  const parsedUserAgent = useragent.parse(req.headers['user-agent'] as string).toString();
  const uagent = parsedUserAgent.startsWith('Other')
    ? req.headers['user-agent']
    : parsedUserAgent;

  const client = {
    ip: req.socket.remoteAddress,
    agent: uagent,
  };

  const token = await Token.findOne({
    requestId,
    'client.ip': client.ip,
    'client.agent': client.agent,
  });

  if (!token) return false;

  const isMatch = await token.compare(
    (otp ?? '').toString(),
    (plainToken ?? '').toString(),
  );
  const isVerified = isMatch.token || isMatch.otp;

  return {
    isMatch,
    isVerified,
    token,
    otp,
    requestId,
    parsedUserAgent,
    client,
    plainToken,
  };
}

/**
 * Change logged user password
 *
 * @route `(/auth/change-password)` `patch`
 * @acl Authenticated
 * @body `{ currentPassword: string, password: string, confirmPassword: string }` Application/JSON
 * @response JSEND{token: JWT} 204
 */
export const patchChangePassword: RequestHandler = async (req, res) => {
  const { password } = req.body;

  if (!req.auth || !req.auth.user)
    responses.failed({ message: 'faild to find logged user' }, res, 401);

  const user = await User.findOneAndUpdate(
    {
      _id: req.auth?.user._id,
    },
    { password },
  );

  if (!user) return responses.failed({ message: 'faild to find logged user' }, res, 401);

  const token = await user.generateJWTToken();

  res.cookie('jwt', `Bearer ${token}`, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1WEEK
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  responses.success({ token }, res, 200);
};

/**
 * Signup
 *
 * @route `(/auth/signup)` `post`
 * @acl unAuthenticated
 * @body `{ name: string, email: string, password: string, confirmPassword: string, phone?: string }` Application/JSON
 * @response JSEND{token: JWT, user: User} 201
 */
export const postSignup: RequestHandler = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const signForm = { name, email, password, phone };

  const user = await User.create(signForm);

  const token = user.generateJWTToken();

  const userJSON = user.toJSON();

  Object.defineProperty(userJSON, 'password', {
    enumerable: false,
  });

  res.cookie('jwt', `Bearer ${token}`, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1WEEK
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  responses.success({ token, user: userJSON }, res, 201);
};

/**
 * Login
 *
 * @route `(/auth/login)` `post`
 * @acl unAuthenticated
 * @body `{ email: string, password: string }` Application/JSON
 * @response JSEND{token: JWT, user: User} 200
 */
export const postLogin: RequestHandler<
  {},
  {},
  { email: string; password: string }
> = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return responses.failed(
      {
        message: 'no user exists with this email address',
        data: { email },
      },
      res,
      401,
    );

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return responses.failed(
      {
        message: 'email or password is incorrect',
        data: { email },
      },
      res,
      401,
    );

  const token = user.generateJWTToken();

  const userJSON = user.toJSON();

  Object.defineProperty(userJSON, 'password', {
    enumerable: false,
  });

  res.cookie('jwt', `Bearer ${token}`, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1WEEK
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  responses.success({ token, user: userJSON }, res, 200);
};

/**
 * Get logged user
 *
 * @route `(/auth)` `get`
 * @acl Authenticated
 * @response JSEND{token: JWT, user: User} 200
 */
export const getLoggedUser: RequestHandler = (req, res) => {
  responses.success(
    {
      token: req.auth?.token,
      user: req.auth?.user,
    },
    res,
    200,
  );
};

/**
 * Logout
 *
 * @route `(/auth/logout)` `post`
 * @acl Authenticated
 * @response NULL 204
 */
export const postLogout: RequestHandler = (req, res) => {
  res.cookie('jwt', null, {
    maxAge: 0, // 0ms to delete
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  responses.success(null, res, 204);
};

/**
 * Forgot password
 *
 * @route `(/auth/forgot-password)` `post`
 * @acl unAuthenticated
 * @body `{ email: string }` Application/JSON
 * @query `{ forwardTo?: http://example.com/api/v1/auth/reset-password + (token=?) }` Application/JSON
 * @response JSEND{ requestId: string } 200
 */
export const postForgotPassword: RequestHandler = async (req, res) => {
  const { forwardTo } = req.query;
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return responses.failed(
      {
        message: `${email} does not exist`,
        data: { email },
      },
      res,
      400,
    );

  await Token.deleteMany({ uid: user._id });

  const requestId = crypto.randomUUID().replaceAll('-', '');
  const { token: plainToken, hashedToken, hashedOtp, otp } = await generateResetToken();

  const parsedUserAgent = useragent.parse(req.headers['user-agent'] as string).toString();
  const uagent = parsedUserAgent.startsWith('Other')
    ? req.headers['user-agent']
    : parsedUserAgent;

  const client = {
    ip: req.socket.remoteAddress,
    port: req.socket.remotePort,
    agent: uagent,
  };

  const token = await Token.create({
    uid: user._id,
    email,
    token: hashedToken,
    otp: hashedOtp,
    requestId,
    client,
  });

  sendEmail({
    mail: {
      to: 'bosaxi7371@m3player.com',
      subject: 'Password Reset',
    },
    render: {
      filename: 'reset-password',
      options: {
        otp,
        resetTokenUrl: forwardTo ? `${forwardTo}?token=${plainToken}` : false,
        device: client.agent,
        ip: client.ip,
      },
    },
  });

  responses.success(
    {
      requestId,
    },
    res,
    200,
  );
};

/**
 * Verify Reset Password Request
 *
 * @route `(/auth/verify-reset-password)` `post`
 * @acl unAuthenticated
 * @body `{ requestId: string, otp?!:1: string }` Application/JSON
 * @query `{ token?1:!: string }` Application/JSON
 * @response JSEND `{
      match: {
        token: boolean;
        otp: boolean;
      },
      isVerified: boolean,
      token: JSONWEBTOKEN,
    }` 200
 */
export const postVerifyResetPassword: RequestHandler = async (req, res) => {
  const verifiedToken = await verifyResetPasswordService(req, res);

  if (verifiedToken === false)
    return responses.failed(
      {
        message: `no reset password request found for this device maybe expired or invalid request id`,
      },
      res,
      400,
    );

  if (!verifiedToken.isVerified)
    return responses.failed(
      {
        message: `invalid reset password request metadata`,
      },
      res,
      400,
    );

  const user = await User.findById(verifiedToken.token.uid);

  if (!user)
    return responses.failed(
      {
        message: `faild to find user, maybe user has been deleted`,
      },
      res,
      400,
    );

  const jwtToken = await user.generateJWTToken();

  responses.success(
    {
      match: verifiedToken.isMatch,
      isVerified: verifiedToken.isVerified,
      token: jwtToken,
    },
    res,
    200,
  );
};

/**
 * Confirm Reset Password Request By Client
 *
 * @route `(/auth/login)` `post`
 * @acl unAuthenticated
 * @body `{ requestId: string, otp?!:1: string }` Application/JSON
 * @query `{ token?1:!: string }` Application/JSON
 * @response JSEND `{
      token: JSONWEBTOKEN,
      user: User
    }` 200
 */
export const postResetPassword: RequestHandler = async (req, res) => {
  const verifiedToken = await verifyResetPasswordService(req, res);

  if (verifiedToken === false)
    return responses.failed(
      {
        message: `no reset password request found for this device maybe expired or invalid request id`,
      },
      res,
      400,
    );

  if (!verifiedToken.isVerified)
    return responses.failed(
      {
        message: `invalid reset password request metadata`,
      },
      res,
      400,
    );

  const user = await User.findOneAndUpdate(
    {
      _id: verifiedToken.token.uid,
    },
    { password: req.body.password },
  );

  if (!user)
    return responses.failed(
      {
        message: `faild to find user, maybe user has been deleted`,
      },
      res,
      400,
    );

  const jwtToken = await user.generateJWTToken();

  res.cookie('jwt', `Bearer ${jwtToken}`, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1WEEK
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  const userJson = user.toJSON();

  Object.defineProperties(userJson, {
    password: { enumerable: false },
    _id: { enumerable: false },
    __v: { enumerable: false },
  });

  responses.success(
    {
      token: jwtToken,
      user: userJson,
    },
    res,
    200,
  );

  await Token.deleteMany({ uid: verifiedToken.token.uid });
};
