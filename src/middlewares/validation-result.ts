import type { RequestHandler } from 'express';
import { validationResult as validate } from 'express-validator';
import { responses } from '@lib/api-response.js';

/**
 * Express middleware to handle validation results from `express-validator`.
 *
 * Checks the request for validation errors. If any errors are found,
 * responds with a 400 status and a standardized failure response using
 * the `responses.failed` method. Otherwise, passes control to the next middleware.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 *
 * @remarks
 * This middleware should be used after validation chains from `express-validator`.
 *
 * @example
 * import { body } from 'express-validator';
 * import validationResult from '@middlewares/validation-result';
 *
 * app.post('/user',
 *   body('email').isEmail(),
 *   validationResult,
 *   (req, res) => { ... }
 * );
 */
const validationResult: RequestHandler = async (req, res, next) => {
  const result = validate(req);

  if (!result.isEmpty()) return responses.failed(result.mapped(), res, 400);

  next();
};

export default validationResult;
