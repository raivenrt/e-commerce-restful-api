import { checkSchema } from 'express-validator';

import Category from '@models/category-model.js';
import slugify from '@lib/slugify.js';

/**
 * Validation schema for the `id` parameter in route parameters.
 *
 * This schema ensures that:
 * - The `id` parameter is present and not empty.
 * - The `id` parameter is a valid MongoDB ObjectId.
 * - The `id` corresponds to an existing category in the database.
 *
 * If any of these checks fail, an appropriate error message is returned.
 *
 * @remarks
 * This schema is intended to be used with express-validator's `checkSchema` middleware
 * for validating category-related route parameters.
 */
export const categoryIdParamSchema = checkSchema({
  id: {
    in: ['params'],
    notEmpty: { errorMessage: 'must be not empty' },
    isMongoId: { errorMessage: 'Invalid format' },
    custom: {
      options: async (value: string) => {
        const category = await Category.findById(value);

        if (!category) throw new Error(`No category exists with this id ${value}`);

        return true;
      },
    },
  },
});

/**
 * Validation schema for creating a new category.
 *
 * This schema validates the `name` field in the request body with the following rules:
 * - Trims whitespace from the input.
 * - Ensures the value is a string.
 * - Ensures the field is not empty.
 * - Ensures the name length is between 3 and 32 characters.
 * - Checks asynchronously if a category with the same name already exists in the database.
 *   - If it exists, throws an error indicating the category already exists.
 *   - If it does not exist, generates a slug from the name and assigns it to `req.body.slug`.
 *
 * @remarks
 * This schema is intended to be used with express-validator's `checkSchema` function.
 *
 * @example
 * app.post('/categories', createCategorySchema, (req, res) => { ... });
 */
export const createCategorySchema = checkSchema({
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
        const category = await Category.findOne({ name: value });
        if (category) throw new Error(`Category ${value} is already exists`);

        req.body.slug = slugify(value);
        return true;
      },
    },
  },
});

/**
 * Validation schema for updating a category.
 *
 * This schema combines the `categoryIdParamSchema` for validating the category ID parameter
 * and additional checks for the request body using `checkSchema`. The body validation includes:
 * - `name` (optional): Must be a non-empty string between 3 and 32 characters.
 *   - Trims whitespace.
 *   - If provided, sets `req.body.slug` to a slugified version of the name.
 *   - Provides custom error messages for type, emptiness, and length constraints.
 *
 * @remarks
 * Intended for use with Express.js route validation middleware (e.g., express-validator).
 */
export const updateCategorySchema = [
  ...categoryIdParamSchema,
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
