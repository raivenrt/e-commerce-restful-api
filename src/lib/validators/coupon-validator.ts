import { checkSchema, type Schema } from 'express-validator';
import toOptionalSchema from '../to-optional-schema.js';
import Coupon from '@base/src/models/coupon-schema.js';
import slugify from '../slugify.js';

const couponSchema: Schema = {
  name: {
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
        max: 75,
      },
    },
    customSanitizer: {
      options: (value: string) => slugify(value),
    },
    custom: {
      options: async function (value: string, { req }) {
        const coupon = await Coupon.findOne({ name: value });

        if (coupon) throw new Error(`Coupon ${value} is already exists`);

        return true;
      },
    },
  },
  expiresAt: {
    isDate: {
      errorMessage: 'must be a valid date',
    },
    notEmpty: {
      errorMessage: 'please fill this field',
    },
  },
  discount: {
    isFloat: {
      errorMessage: 'must be a valid float value',
    },
    notEmpty: {
      errorMessage: 'please fill this field',
    },
  },
};

export const couponIdParamSchema = checkSchema({
  id: {
    in: ['params'],
    notEmpty: { errorMessage: 'must be not empty' },
    isMongoId: { errorMessage: 'Invalid format' },
    custom: {
      options: async (value: string) => {
        const coupon = await Coupon.findById(value);

        if (!coupon) throw new Error(`No coupon exists with this id ${value}`);

        return true;
      },
    },
  },
});

export const createCouponSchema = checkSchema(couponSchema);
export const updateCouponSchema = [
  couponIdParamSchema,
  checkSchema(toOptionalSchema(couponSchema)),
].flat();
