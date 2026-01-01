import User from '@models/user-model.js';
import Product from '@models/products-model.js';
import { checkSchema, type Schema } from 'express-validator';
import { Types } from 'mongoose';
import Review from '@base/src/models/review-model.js';
import toOptionalSchema from '../to-optional-schema.js';

const reviewSchema: Schema = {
  description: {
    optional: true,
    isString: {
      errorMessage: 'must be a string value',
    },
    isLength: {
      errorMessage: 'description must be between 2 and 256 characters',
      options: {
        min: 2,
        max: 256,
      },
    },
  },
  ratings: {
    isFloat: {
      errorMessage: 'ratings range must be between 1-5 range',
      options: {
        min: 1,
        max: 5,
      },
    },
  },
  product: {
    isMongoId: {
      errorMessage: 'invalid product id',
    },
    custom: {
      options: async (productId) => {
        const product = await Product.findById(productId);
        if (!product) throw new Error(`no product exists with this id ${productId}`);
        return true;
      },
    },
  },
};

const reviewIdSchema: Schema = {
  id: {
    in: ['params'],
    notEmpty: { errorMessage: 'must be not empty' },
    isMongoId: { errorMessage: 'Invalid format' },
    custom: {
      options: async (id) => {
        const review = await Review.findById(id);
        if (!review) throw new Error(`no review exists with this id ${id}`);
        return true;
      },
    },
  },
};

export const updateReviewSchema = checkSchema(
  toOptionalSchema({ ...reviewSchema, ...reviewIdSchema }),
);

export const createReviewSchema = checkSchema({
  ...reviewSchema,

  user: {
    isMongoId: {
      errorMessage: 'invalid user id',
    },
    custom: {
      options: async (userId, { req }) => {
        const user = await User.findById(userId);
        if (!user) throw new Error(`no user exists with this id ${userId}`);

        const review = await Review.findOne({
          user: userId,
          product: req.body.product,
        });

        if (review) throw new Error(`user already reviewed this product`);

        return true;
      },
    },
  },
} as Schema);

export const reviewIdParamSchema = checkSchema(reviewIdSchema);
