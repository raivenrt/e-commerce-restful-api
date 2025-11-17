import { checkSchema, oneOf } from 'express-validator';

import slugify from '@lib/slugify.js';

import Product from '@models/products-model.js';
import Category from '@models/category-model.js';
import SubCategory from '@models/subcategory-model.js';
import Brand from '@models/brand-model.js';
import { Types } from 'mongoose';

/**
 * Validation schema for validating product ID parameter in routes.
 *
 * This schema checks:
 * - `id` (in route params): Required, must not be empty, must be a valid MongoDB ObjectId, and must reference an existing Product.
 *
 * If validation fails, an appropriate error message is returned.
 *
 * @remarks
 * Use this schema as middleware with express-validator's `checkSchema` for product routes.
 *
 * Example usage:
 * ```ts
 * router.get('/products/:id', productIdParamSchema, controller.getProduct);
 * router.delete('/products/:id', productIdParamSchema, controller.deleteProduct);
 * ```
 */
export const productIdParamSchema = checkSchema({
  id: {
    in: ['params'],
    notEmpty: { errorMessage: 'must be not empty' },
    isMongoId: { errorMessage: 'Invalid format' },
    custom: {
      options: async (value: string) => {
        const product = await Product.findById(value);

        if (!product) throw new Error(`No product exists with this id ${value}`);

        return true;
      },
    },
  },
});

/**
 * Validation schema for creating a new product.
 *
 * This schema validates request body fields:
 * - title: trim, string, required, length 3-128, async uniqueness check; on success sets req.body.slug.
 * - description: trim, string, required, length 20-512.
 * - qunatity: required integer >= 0.
 * - sold: optional integer >= 0.
 * - price: required numeric/float >= 0.
 * - priceAfterDiscount: optional numeric/float >= 0.
 * - colors: optional array; each element must be a valid HEX or RGB(A) color (enforced via oneOf).
 * - images: optional array; each element must be a string.
 * - imageCover: required string.
 * - category: required MongoId and must exist (async).
 * - subcategory: optional MongoId; if provided must exist and belong to the provided category (async).
 * - brand: optional MongoId and must exist (async).
 * - ratingsAverage: optional integer between 1 and 5.
 * - ratingQuantity: optional integer >= 0.
 *
 * @remarks
 * Combines checkSchema field validators with a oneOf rule to accept HEX or RGB(A) color formats.
 *
 * @example
 * router.post('/products', createProductSchema, validateRequest, productController.createProduct);
 */

export const createProductSchema = [
  ...checkSchema({
    title: {
      trim: true,
      isString: {
        errorMessage: 'must be a string value',
      },
      notEmpty: {
        errorMessage: 'please fill this field',
      },
      isLength: {
        errorMessage: 'length must be between 3 and 128 characters',
        options: {
          min: 3,
          max: 128,
        },
      },
      custom: {
        options: async (value, { req }) => {
          const product = await Product.findOne({ name: value });
          if (product) throw new Error(`Product ${value} is already exists`);

          req.body.slug = slugify(value);
          return true;
        },
      },
    },
    description: {
      trim: true,
      isString: {
        errorMessage: 'must be a string value',
      },
      notEmpty: {
        errorMessage: 'please fill this field',
      },
      isLength: {
        errorMessage: 'length must be between 20 and 612 characters',
        options: {
          min: 20,
          max: 512,
        },
      },
    },
    qunatity: {
      notEmpty: {
        errorMessage: 'please fill this field',
      },
      isInt: {
        errorMessage: 'must be a valid integer greator than or equal 0',
        options: {
          min: 0,
        },
      },
    },
    sold: {
      optional: true,
      isInt: {
        errorMessage: 'must be a valid integer greator than or equal 0',
        options: {
          min: 0,
        },
      },
    },

    price: {
      notEmpty: {
        errorMessage: 'please fill this field',
      },
      isNumeric: {
        errorMessage: 'must be a valid number',
      },
      isFloat: {
        errorMessage: 'must be greater than or equal 0',
        options: {
          min: 0,
        },
      },
    },
    priceAfterDiscount: {
      optional: true,
      isNumeric: {
        errorMessage: 'must be a valid number',
      },
      isFloat: {
        errorMessage: 'must be greater than or equal 0',
        options: {
          min: 0,
        },
      },
    },

    colors: {
      optional: true,
      isArray: {
        errorMessage: 'must be an array',
      },
    },

    images: {
      optional: true,
      isArray: {
        errorMessage: 'must be an array',
      },
    },
    'images.*': {
      isString: {
        errorMessage: 'must be a valid string',
      },
    },

    imageCover: {
      notEmpty: {
        errorMessage: 'please fill this field',
      },
      isString: {
        errorMessage: 'must be a valid string',
      },
    },

    category: {
      notEmpty: {
        errorMessage: 'product must belong to category',
      },
      isMongoId: {
        errorMessage: 'invalid id foramt',
      },
      custom: {
        options: async (categoryIdArg) => {
          const category = await Category.findById(categoryIdArg);

          if (!category)
            throw new Error(`no category exists with this id ${categoryIdArg}`);

          return true;
        },
      },
    },

    subcategories: {
      optional: true,
      isArray: {
        errorMessage: 'must be an array',
      },
      custom: {
        options: async (subcategoriesIdList: any[], { req: { body } }) => {
          const isValidList = subcategoriesIdList.every((id) =>
            Types.ObjectId.isValid(id),
          );

          if (!isValidList) throw new Error('invalid subcategories id format');

          const subcategories = await SubCategory.find({
            _id: { $in: subcategoriesIdList, $exists: true },
            category: body.category,
          });

          const existsSubCategories = subcategories.map((subcategory) =>
            subcategory.toJSON()._id.toString(),
          );

          const notExistsSubCategories = subcategoriesIdList.filter(
            (id) => !existsSubCategories.includes(id),
          );

          if (notExistsSubCategories.length > 0)
            throw new Error(
              `no subcategory exists with this id [${notExistsSubCategories.join(', ')}], or not belong to category ${body.category}`,
            );

          return true;
        },
      },
    },

    brand: {
      optional: true,
      isMongoId: {
        errorMessage: 'invalid id foramt',
      },
      custom: {
        options: async (brandIdArg) => {
          const brand = await Brand.findById(brandIdArg);

          if (!brand) throw new Error(`no brand exists with this id ${brandIdArg}`);

          return true;
        },
      },
    },

    ratingsAverage: {
      optional: true,
      isInt: {
        errorMessage: 'ratings average range must be between 1-5 range',
        options: {
          min: 1,
          max: 5,
        },
      },
    },
    ratingQuantity: {
      optional: true,
      isInt: {
        errorMessage: 'rating quantity must be greator than or equal 0',
        options: {
          min: 0,
        },
      },
    },
  }),

  oneOf(
    [
      checkSchema({
        'colors.*': {
          isHexColor: {
            errorMessage: 'must be a valid HEX color',
          },
        },
      }),
      checkSchema({
        'colors.*': {
          isRgbColor: {
            errorMessage: 'must be a valid RGB(A) color',
          },
        },
      }),
    ],
    {
      message: 'Each color must be a valid HEX or RGB(A) color',
    },
  ),
];

/**
 * Validation schema for updating an existing product.
 *
 * This schema validates request params and body fields when updating a product:
 * - Ensures `:id` route param is present and references an existing Product (uses productIdParamSchema).
 * - title: optional, trimmed string, length 3-128, async uniqueness check; on success sets req.body.slug.
 * - description: optional, trimmed string, length 20-512.
 * - qunatity / sold: optional integers >= 0.
 * - price / priceAfterDiscount: optional numeric/float >= 0.
 * - colors: optional array; elements must be valid HEX or RGB(A) (enforced via oneOf).
 * - images: optional array; each element must be a string.
 * - imageCover: optional string.
 * - category: optional, must be a valid MongoDB ObjectId and exist.
 * - subcategory: optional, must be a valid MongoDB ObjectId, must exist and belong to provided category.
 * - brand: optional, must be a valid MongoDB ObjectId and exist.
 * - ratingsAverage: optional integer between 1 and 5.
 * - ratingQuantity: optional integer >= 0.
 *
 * @remarks
 * Combines productIdParamSchema, checkSchema field validators and a oneOf rule for color formats.
 * Custom validators perform async DB existence and relationship checks; title validator updates req.body.slug.
 *
 * @example
 * router.put('/products/:id', updateProductSchema, validateRequest, productController.updateProduct);
 */

export const updateProductSchema = [
  ...productIdParamSchema,
  ...checkSchema({
    title: {
      optional: true,
      trim: true,
      isString: {
        errorMessage: 'must be a string value',
      },
      notEmpty: {
        errorMessage: 'please fill this field',
      },
      isLength: {
        errorMessage: 'length must be between 3 and 128 characters',
        options: {
          min: 3,
          max: 128,
        },
      },
      custom: {
        options: async (value, { req }) => {
          const product = await Product.findOne({ name: value });
          if (product)
            throw new Error(
              `Can't update product name, becuse ${value} is already exists in another product`,
            );

          req.body.slug = slugify(value);
          return true;
        },
      },
    },
    description: {
      optional: true,
      trim: true,
      isString: {
        errorMessage: 'must be a string value',
      },
      notEmpty: {
        errorMessage: 'please fill this field',
      },
      isLength: {
        errorMessage: 'length must be between 20 and 612 characters',
        options: {
          min: 20,
          max: 512,
        },
      },
    },
    qunatity: {
      optional: true,
      notEmpty: {
        errorMessage: 'please fill this field',
      },
      isInt: {
        errorMessage: 'must be a valid integer greator than or equal 0',
        options: {
          min: 0,
        },
      },
    },
    sold: {
      optional: true,
      isInt: {
        errorMessage: 'must be a valid integer greator than or equal 0',
        options: {
          min: 0,
        },
      },
    },

    price: {
      optional: true,
      notEmpty: {
        errorMessage: 'please fill this field',
      },
      isNumeric: {
        errorMessage: 'must be a valid number',
      },
      isFloat: {
        errorMessage: 'must be greater than or equal 0',
        options: {
          min: 0,
        },
      },
    },
    priceAfterDiscount: {
      optional: true,
      isNumeric: {
        errorMessage: 'must be a valid number',
      },
      isFloat: {
        errorMessage: 'must be greater than or equal 0',
        options: {
          min: 0,
        },
      },
    },

    colors: {
      optional: true,
      isArray: {
        errorMessage: 'must be an array',
      },
    },

    images: {
      optional: true,
      isArray: {
        errorMessage: 'must be an array',
      },
    },
    'images.*': {
      isString: {
        errorMessage: 'must be a valid string',
      },
    },

    imageCover: {
      optional: true,
      notEmpty: {
        errorMessage: 'please fill this field',
      },
      isString: {
        errorMessage: 'must be a valid string',
      },
    },

    category: {
      optional: true,
      notEmpty: {
        errorMessage: 'product must belong to category',
      },
      isMongoId: {
        errorMessage: 'invalid id foramt',
      },
      custom: {
        options: async (categoryIdArg) => {
          const category = await Category.findById(categoryIdArg);

          if (!category)
            throw new Error(`no category exists with this id ${categoryIdArg}`);

          return true;
        },
      },
    },

    subcategories: {
      optional: true,
      isArray: {
        errorMessage: 'must be an array',
      },
      custom: {
        options: async (subcategoriesIdList: any[], { req: { body } }) => {
          const isValidList = subcategoriesIdList.every((id) =>
            Types.ObjectId.isValid(id),
          );

          if (!isValidList) throw new Error('invalid subcategories id format');

          const subcategories = await SubCategory.find({
            _id: { $in: subcategoriesIdList, $exists: true },
            category: body.category,
          });

          const existsSubCategories = subcategories.map((subcategory) =>
            subcategory.toJSON()._id.toString(),
          );

          const notExistsSubCategories = subcategoriesIdList.filter(
            (id) => !existsSubCategories.includes(id),
          );

          if (notExistsSubCategories.length > 0)
            throw new Error(
              `no subcategory exists with this id [${notExistsSubCategories.join(', ')}], or not belong to category ${body.category}`,
            );

          return true;
        },
      },
    },

    brand: {
      optional: true,
      isMongoId: {
        errorMessage: 'invalid id foramt',
      },
      custom: {
        options: async (brandIdArg) => {
          const brand = await Brand.findById(brandIdArg);

          if (!brand) throw new Error(`no brand exists with this id ${brandIdArg}`);

          return true;
        },
      },
    },

    ratingsAverage: {
      optional: true,
      isInt: {
        errorMessage: 'ratings average range must be between 1-5 range',
        options: {
          min: 1,
          max: 5,
        },
      },
    },
    ratingQuantity: {
      optional: true,
      isInt: {
        errorMessage: 'rating quantity must be greator than or equal 0',
        options: {
          min: 0,
        },
      },
    },
  }),

  oneOf(
    [
      checkSchema({
        'colors.*': {
          isHexColor: {
            errorMessage: 'must be a valid HEX color',
          },
        },
      }),
      checkSchema({
        'colors.*': {
          isRgbColor: {
            errorMessage: 'must be a valid RGB(A) color',
          },
        },
      }),
    ],
    {
      message: 'Each color must be a valid HEX or RGB(A) color',
    },
  ),
];

/**
 * Validation schema for retrieving products with optional pagination.
 *
 * This schema validates the following query parameters:
 * - `page` (optional): Must be an integer greater than 0. If provided, it is converted to an integer.
 * - `limit` (optional): Must be an integer greater than 0. If provided, it is converted to an integer.
 *
 * Used with express-validator's `checkSchema` to ensure correct query parameter types and values.
 */
export const getProductsSchema = checkSchema({
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
