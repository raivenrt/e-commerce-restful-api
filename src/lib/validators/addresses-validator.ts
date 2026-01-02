import { checkSchema, type Schema } from 'express-validator';
import toOptionalSchema from '../to-optional-schema.js';

const addressSchema: Schema = {
  alias: {
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
  },
  details: {
    trim: true,
    isString: {
      errorMessage: 'must be a string value',
    },
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    isLength: {
      errorMessage: 'name must be between 2 and 128 characters',
      options: {
        min: 2,
        max: 128,
      },
    },
  },
  phone: {
    isString: {
      errorMessage: 'must be a string value',
    },
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    isMobilePhone: {
      errorMessage: 'must be a valid phone number',
    },
  },
  pincode: {
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    isInt: {
      errorMessage: 'must be a valid integer',
    },
    isPostalCode: {
      errorMessage: 'must be a valid postal code',
      options: ['any'],
    },
  },
  city: {
    trim: true,
    isString: {
      errorMessage: 'must be a string value',
    },
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    isLength: {
      errorMessage: 'city name must be between 2 and 32 characters',
      options: {
        min: 2,
        max: 32,
      },
    },
  },
  state: {
    trim: true,
    isString: {
      errorMessage: 'must be a string value',
    },
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    isLength: {
      errorMessage: 'state name must be between 2 and 32 characters',
      options: {
        min: 2,
        max: 32,
      },
    },
  },
  country: {
    trim: true,
    isString: {
      errorMessage: 'must be a string value',
    },
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    isLength: {
      errorMessage: 'country name must be between 2 and 32 characters',
      options: {
        min: 2,
        max: 32,
      },
    },
  },
};

export const createAddressSchema = checkSchema(addressSchema);

export const updateAddressSchema = checkSchema(toOptionalSchema(addressSchema));

export const addressIdParamSchema = checkSchema({
  id: {
    in: ['params'],
    notEmpty: { errorMessage: 'must be not empty' },
    isMongoId: { errorMessage: 'Invalid format' },
  },
});
