import { checkSchema } from 'express-validator';

import Brand from '@models/brand-model.js';
import slugify from '@lib/slugify.js';

export const brandIdParamSchema = checkSchema({
  id: {
    in: ['params'],
    notEmpty: { errorMessage: 'must be not empty' },
    isMongoId: { errorMessage: 'Invalid format' },
    custom: {
      options: async (value: string) => {
        const brand = await Brand.findById(value);

        if (!brand) throw new Error(`No brand exists with this id ${value}`);

        return true;
      },
    },
  },
});

/**
 * Validation schema for creating a new brand.
 *
 * This schema validates the `name` field in the request body with the following rules:
 * - Trims whitespace from the input.
 * - Ensures the value is a string.
 * - Ensures the field is not empty.
 * - Ensures the name length is between 3 and 32 characters.
 * - Checks asynchronously if a brand with the same name already exists in the database.
 *   - If it exists, throws an error indicating the brand already exists.
 *   - If it does not exist, generates a slug from the name and assigns it to `req.body.slug`.
 *
 * @remarks
 * This schema is intended to be used with express-validator's `checkSchema` function.
 *
 * @example
 * app.post('/brands', createBrandSchema, (req, res) => { ... });
 */
export const createBrandSchema = checkSchema({
  name: {
    trim: true,
    isString: {
      errorMessage: 'must be a string value',
    },
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    isLength: {
      errorMessage: 'name must be between 3 and 32 characters',
      options: {
        min: 3,
        max: 32,
      },
    },
    custom: {
      options: async (value, { req }) => {
        const brand = await Brand.findOne({ name: value });
        if (brand) throw new Error(`Brand ${value} is already exists`);

        req.body.slug = slugify(value);
        return true;
      },
    },
  },
});

/**
 * Validation schema for updating a brand.
 *
 * This schema combines the `brandIdParamSchema` for validating the brand ID parameter
 * and additional checks for the request body using `checkSchema`. The body validation includes:
 * - `name` (optional): Must be a non-empty string between 3 and 32 characters.
 *   - Trims whitespace.
 *   - If provided, sets `req.body.slug` to a slugified version of the name.
 *   - Provides custom error messages for type, emptiness, and length constraints.
 *
 * @remarks
 * Intended for use with Express.js route validation middleware (e.g., express-validator).
 */
export const updateBrandSchema = [
  ...brandIdParamSchema,
  ...checkSchema({
    name: {
      trim: true,
      optional: true,
      isString: {
        errorMessage: 'must be a string value',
      },
      notEmpty: {
        errorMessage: 'please fill this field',
      },
      isLength: {
        errorMessage: 'name must be between 3 and 32 characters',
        options: {
          min: 3,
          max: 32,
        },
      },
      custom: {
        options: (value, { req }) => {
          req.body.slug = slugify(value);
          return true;
        },
      },
    },
  }),
];

/**
 * Validation schema for retrieving brands with optional pagination.
 *
 * This schema validates the following query parameters:
 * - `page` (optional): Must be an integer greater than 0. If provided, it is converted to an integer.
 * - `limit` (optional): Must be an integer greater than 0. If provided, it is converted to an integer.
 *
 * Used with express-validator's `checkSchema` to ensure correct query parameter types and values.
 */
export const getCategoriesSchema = checkSchema({
  page: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'page must be an integer greater than 0',
    },
    toInt: true,
  },
  limit: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'limit must be an integer greater than 0',
    },
    toInt: true,
  },
});
