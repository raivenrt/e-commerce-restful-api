import { checkSchema } from 'express-validator';

import SubCategory from '@models/subcategory-model.js';
import slugify from '@lib/slugify.js';
import Category from '@models/category-model.js';

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
