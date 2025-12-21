import { checkSchema } from 'express-validator';

import Category from '@models/category-model.js';
import slugify from '@lib/slugify.js';
import createIdParamValidator from '../create-id-param-validator.js';
import type { Schema } from 'express-validator';
import toOptionalSchema from '../to-optional-schema.js';

const schema: Schema = {
  name: {
    trim: true,
    isString: {
      errorMessage: 'must be a string value',
    },
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    isLength: {
      errorMessage: 'name must be between 2 and 30 characters',
      options: {
        min: 2,
        max: 30,
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
  image: {
    optional: true,
    isString: {
      errorMessage: 'must be a string value',
    },
  },
};

export const categoryIdParamSchema = createIdParamValidator({ model: Category });

export const createCategorySchema = checkSchema(schema);

export const updateCategorySchema = [
  ...categoryIdParamSchema,
  ...checkSchema(toOptionalSchema(schema)),
];

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
