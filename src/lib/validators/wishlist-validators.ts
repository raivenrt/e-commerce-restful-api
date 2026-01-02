import Product from '@base/src/models/products-model.js';
import { checkSchema } from 'express-validator';

const productExistsValidator = async (value: string) => {
  const product = await Product.findById(value);

  if (!product) throw new Error(`No product exists with this id ${value}`);

  return true;
};

export const wishlistIdParamSchema = checkSchema({
  id: {
    in: ['params'],
    notEmpty: { errorMessage: 'must be not empty' },
    isMongoId: { errorMessage: 'Invalid format' },
    custom: {
      options: productExistsValidator,
    },
  },
});

export const addProductToWishlistSchema = checkSchema({
  productId: {
    notEmpty: { errorMessage: 'must be not empty' },
    isMongoId: { errorMessage: 'Invalid format' },
    custom: {
      options: productExistsValidator,
    },
  },
});
