import { checkSchema, type Schema } from 'express-validator';

import User from '@models/user-model.js';
import createIdParamValidator from '@lib/create-id-param-validator.js';
import toOptionalSchema from '@lib/to-optional-schema.js';
import type { Types } from 'mongoose';

export const schema: Schema = {
  name: {
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
  email: {
    trim: true,
    isString: {
      errorMessage: 'must be a string value',
    },
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    isEmail: {
      errorMessage: 'must be a valid email',
    },
    toLowerCase: true,
    custom: {
      options: async (email, { req }) => {
        const userId = req.params?.id;
        const user = await User.findOne({ email });

        if (!user) return true;

        console.log(user);

        if (userId && (user._id as Types.ObjectId).equals(userId))
          throw new Error(`User ${email} is already used in this account`);
        else throw new Error(`User ${email} is already exists`);
      },
    },
  },
  password: {
    trim: true,
    isString: {
      errorMessage: 'must be a string value',
    },
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    isStrongPassword: {
      errorMessage:
        'password must be strong contains at least 1 lowercase, 1 uppercase, 1 number and 1 symbol and at least 10 characters',
      options: {
        minLength: 10,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      },
    },
    custom: {
      options: function (password, { req }) {
        if (!req.body.confirmPassword)
          throw new Error('please fill confirm password field');
        return true;
      },
    },
  },
  confirmPassword: {
    trim: true,
    notEmpty: {
      errorMessage: 'please fill this field',
    },
    custom: {
      options: function (confirmPassword, { req }) {
        const { password } = req.body;

        if (!password) throw new Error('please fill password field first.');
        else if (password !== confirmPassword)
          throw new Error('password and confirm password must be same');

        return true;
      },
    },
  },
  avatar: {
    optional: true,
    isString: {
      errorMessage: 'must be a string value',
    },
  },
  phone: {
    optional: true,
    isString: {
      errorMessage: 'must be a string value',
    },
    isMobilePhone: {
      errorMessage: 'must be a valid phone number',
    },
  },
  role: {
    optional: true,
    isString: {
      errorMessage: 'must be a string value',
    },
    isIn: {
      options: [0, 1],
      errorMessage: 'role must be 0 for admin or 1 for user',
    },
  },
};

export const userIdParamSchema = createIdParamValidator({ model: User });

export const createUserSchema = checkSchema(schema);

export const updateUserSchema = [
  ...userIdParamSchema,
  ...checkSchema(toOptionalSchema(schema)),
];

export const getUsersSchema = checkSchema({
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
