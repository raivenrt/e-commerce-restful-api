import { checkSchema, type Schema } from 'express-validator';

import Brand from '@models/brand-model.js';
import slugify from '@lib/slugify.js';
import createIdParamValidator from '../create-id-param-validator.js';
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
        const brand = await Brand.findOne({ name: value });
        if (brand) throw new Error(`Brand ${value} is already exists`);

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

export const brandIdParamSchema = createIdParamValidator({ model: Brand });

export const createBrandSchema = checkSchema(schema);

export const updateBrandSchema = [
  ...brandIdParamSchema,
  ...checkSchema(toOptionalSchema(schema)),
];

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
