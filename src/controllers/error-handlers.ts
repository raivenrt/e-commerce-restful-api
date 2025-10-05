import type { ErrorRequestHandler, RequestHandler } from 'express';
import { responses } from '@lib/api-response.js';

/**
 * Handles 404 Not Found errors for incoming requests.
 *
 * Sends a standardized failed response with a 404 status code,
 * including the request path and method.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export const e404Handler: RequestHandler = async (req, res, next) => {
  responses.failed(
    {
      message: '404 Not Found',
      path: req.path,
      method: req.method,
    },
    res,
    404,
  );
};

/**
 * Global error handler middleware for Express.
 *
 * Intended to catch and process any errors thrown in the application.
 * Should send an appropriate error response to the client.
 *
 * @param error - The error object caught by Express
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
const globalErrorHandler: ErrorRequestHandler = async (error, req, res, next) => {
  // Catch Known Errors Example:
  //   if (error instanceof MongooseError)
  //     return responses.error('Internal Server Error', res, 500);

  responses.error(error.message ?? 'Internal Server Error', res, 500);
};

export default globalErrorHandler;
