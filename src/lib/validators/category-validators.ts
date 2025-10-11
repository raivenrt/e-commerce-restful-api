import { checkSchema } from 'express-validator';

import Category from '@models/category-model.js';
import slugify from '@lib/slugify.js';

/**
 * Validation schema for validating category ID parameters in routes.
 *
 * This schema checks:
 * - `id` (in route params): Required, must not be empty, must be a valid MongoDB ObjectId, and must reference an existing Category.
 * - `categoryId` (in route params, optional): If present, must be a valid MongoDB ObjectId and must reference an existing Category.
 *
 * If any validation fails, an appropriate error message is returned.
 *
 * @remarks
 * Use this schema as middleware with express-validator's `checkSchema` for routes that require a valid category ID.
 *
 * Example usage:
 * ```ts
 * router.get('/categories/:id', categoryIdParamSchema, controller.getCategory);
 * router.get('/categories/:categoryId/items', categoryIdParamSchema, controller.getItemsByCategory);
 * ```
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
  categoryId: {
    in: ['params'],
    optional: true,
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
 * Validation schema for validating the `categoryId` parameter in nested routes.
 *
 * This schema checks:
 * - `categoryId` (in route params): Required, must not be empty, must be a valid MongoDB ObjectId, and must reference an existing Category.
 * - For `GET` and `POST` requests where the path ends with `/`, it:
 *   - Ensures the parent category exists.
 *   - Sets `req.filterQuery` to filter by the category.
 *   - For `POST` requests, also sets `req.body.category` to the category ID.
 *
 * If any validation fails, an appropriate error message is returned.
 *
 * @remarks
 * Use this schema as middleware with express-validator's `checkSchema` for nested category routes.
 *
 * Example usage:
 * ```ts
 * router.get('/categories/:categoryId/items', nestedRouteCategoryIdSchema, controller.getItemsByCategory);
 * router.post('/categories/:categoryId/items', nestedRouteCategoryIdSchema, controller.createItemInCategory);
 * ```
 */
export const nestedRouteCategoryIdSchema = checkSchema({
  categoryId: {
    in: ['params'],
    notEmpty: { errorMessage: 'must be not empty' },
    isMongoId: { errorMessage: 'Invalid format' },
    custom: {
      options: async (value: string, { req }) => {
        if (['GET', 'POST'].includes(req.method) && req.path.endsWith('/')) {
          const category = await Category.findById(value);
          if (!category)
            throw new Error(`No parent category exists with this id ${value}`);

          req.filterQuery = { category: value };
          if (['POST'].includes(req.method)) req.body.category = value;

          return true;
        }
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

/**
 * Validation schema for retrieving categories with optional pagination.
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
