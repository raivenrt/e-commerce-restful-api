import { checkSchema, oneOf } from 'express-validator';

import slugify from '@lib/slugify.js';

import Product from '@models/products-model.js';
import Category from '@models/category-model.js';
import SubCategory from '@models/subcategory-model.js';
import Brand from '@models/brand-model.js';
import { Types } from 'mongoose';
import createIdParamValidator from '../create-id-param-validator.js';
import { type Schema } from 'express-validator';
import toOptionalSchema from '../to-optional-schema.js';

const schema: Schema = {
  title: {
    trim: true,
    isString: {
      errorMessage: 'must be a string value',
    },
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    isLength: {
      errorMessage: 'length must be between 2 and 128 characters',
      options: {
        min: 2,
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
        const isValidList = subcategoriesIdList.every((id) => Types.ObjectId.isValid(id));

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
};

const RGB_OR_HEX_ONEOF_SCHEMA = oneOf(
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
);

export const productIdParamSchema = createIdParamValidator({ model: Product });

export const createProductSchema = [...checkSchema(schema), RGB_OR_HEX_ONEOF_SCHEMA];

export const updateProductSchema = [
  ...productIdParamSchema,
  ...checkSchema(toOptionalSchema(schema)),
  RGB_OR_HEX_ONEOF_SCHEMA,
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
