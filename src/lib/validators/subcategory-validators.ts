import { checkSchema } from 'express-validator';

import SubCategory from '@models/subcategory-model.js';
import slugify from '@lib/slugify.js';
import Category from '@models/category-model.js';

/**
 * Validation schema for validating the `id` parameter in subcategory routes.
 *
 * This schema ensures:
 * - The `id` parameter exists in the route parameters and is not empty.
 * - The `id` is a valid MongoDB ObjectId.
 * - A SubCategory with the given `id` exists in the database.
 * - If a `categoryId` parameter is present in the route, it checks:
 *   - The parent Category exists.
 *   - The SubCategory belongs to the specified parent Category.
 *
 * If any validation fails, an appropriate error message is returned.
 *
 * @remarks
 * Use this schema as middleware with express-validator's `checkSchema` for routes that require a valid subcategory ID.
 *
 * Example usage:
 * ```ts
 * router.get('/categories/:categoryId/subcategories/:id', subCategoryIdParamSchema, controller.getSubCategory);
 * ```
 */
export const subCategoryIdParamSchema = checkSchema({
  id: {
    in: ['params'],
    notEmpty: { errorMessage: 'must be not empty' },
    isMongoId: { errorMessage: 'Invalid format' },
    custom: {
      options: async (value: string, { req }) => {
        const subcategory = await SubCategory.findById(
          value,
          {},
          {
            populate: { path: 'category', select: { name: true, _id: true } },
          },
        );

        if (!subcategory) throw new Error(`No SubCategory exists with this id ${value}`);

        const parentCategoryId = req.params?.categoryId ?? false;
        if (parentCategoryId) {
          const parentCategory = await Category.findById(parentCategoryId);

          if (!parentCategory)
            throw new Error(`No parent category exists with this id ${value}`);

          if (
            subcategory.category instanceof Category &&
            String(subcategory.category._id) !== parentCategoryId
          )
            throw new Error(
              `SubCategory '${subcategory.name}' dosn't belongs to '${parentCategory.name}' it belongs to '${subcategory.category.name}'`,
            );
        }

        return true;
      },
    },
  },
});

/**
 * Validation schema for creating a new SubCategory.
 *
 * This schema validates the following fields in the request body:
 * - `name`: Required string, trimmed, must be unique, and between 2 and 32 characters.
 *   - Automatically generates a slug from the name and assigns it to `req.body.slug`.
 * - `category`: Required, must be a valid MongoDB ObjectId, and must reference an existing Category.
 *
 * If any validation fails, an appropriate error message is returned.
 *
 * @remarks
 * Use this schema as middleware with express-validator's `checkSchema` for subcategory creation routes.
 *
 * Example usage:
 * ```ts
 * router.post('/subcategories', createSubCategorySchema, controller.createSubCategory);
 * ```
 */

export const createSubCategorySchema = checkSchema({
  name: {
    trim: true,
    isString: {
      errorMessage: 'must be a string value',
    },
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    isLength: {
      errorMessage: 'name must be between 2 and 32 characters',
      options: {
        min: 2,
        max: 32,
      },
    },
    custom: {
      options: async (value, { req }) => {
        const subcategory = await SubCategory.findOne({ name: value });
        if (subcategory) throw new Error(`SubCategory ${value} is already exists`);

        req.body.slug = slugify(value);
        return true;
      },
    },
  },
  category: {
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    isMongoId: {
      errorMessage: 'invalid category id format',
    },
    custom: {
      options: async (value) => {
        const parentCategory = await Category.findById(value);

        if (!parentCategory)
          throw new Error(`no parent category exists with this id ${value}`);

        return true;
      },
    },
  },
});

/**
 * Validation schema for updating an existing SubCategory.
 *
 * This schema validates:
 * - The `id` parameter in the route params to ensure it is a valid MongoDB ObjectId and references an existing SubCategory.
 * - The `name` field in the request body (if provided): must be a string, trimmed, unique, and between 2 and 32 characters.
 *   - If provided, automatically generates a slug from the name and assigns it to `req.body.slug`.
 * - The `category` field in the request body (if provided): must be a valid MongoDB ObjectId and reference an existing Category.
 *
 * If any validation fails, an appropriate error message is returned.
 *
 * @remarks
 * Use this schema as middleware with express-validator's `checkSchema` for subcategory update routes.
 *
 * Example usage:
 * ```ts
 * router.put('/subcategories/:id', updateSubCategorySchema, controller.updateSubCategory);
 * ```
 */
export const updateSubCategorySchema = [
  ...subCategoryIdParamSchema,
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
          min: 2,
          max: 32,
        },
      },
      custom: {
        options: async (value, { req }) => {
          const subcategory = await SubCategory.findOne({ name: value });

          if (subcategory) {
            if (subcategory.name === value && String(subcategory._id) === req.params?.id)
              throw new Error(`This subcategory already named ${subcategory.name}`);
            else
              throw new Error(
                `Can't update SubCategory name to '${value}' becuse it's already used by other subcategory`,
              );
          }

          req.body.slug = slugify(value);
          return true;
        },
      },
    },
    category: {
      optional: true,
      notEmpty: {
        errorMessage: 'please fill this field',
      },
      isMongoId: {
        errorMessage: 'invalid category id format',
      },
      custom: {
        options: async (value, { req }) => {
          const parentCategory = await Category.findById(value);

          if (!parentCategory)
            throw new Error(`no parent category exists with this id ${value}`);

          return true;
        },
      },
    },
  }),
];

/**
 * Validation schema for retrieving subcategories with pagination.
 *
 * This schema validates the following query parameters:
 * - `page`: Optional. Must be an integer greater than 0. Converts the value to an integer.
 * - `limit`: Optional. Must be an integer greater than 0. Converts the value to an integer.
 *
 * If any validation fails, an appropriate error message is returned.
 *
 * @remarks
 * Use this schema as middleware with express-validator's `checkSchema` for subcategory listing routes.
 *
 * Example usage:
 * ```ts
 * router.get('/subcategories', getSubCategoriesSchema, controller.getSubCategories);
 * ```
 */
export const getSubCategoriesSchema = checkSchema({
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
