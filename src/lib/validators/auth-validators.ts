import User from '@base/src/models/user-model.js';
import { schema } from '@lib/validators/user-validators.js';
import { checkSchema, type Schema } from 'express-validator';

const { name, email, password, confirmPassword, phone } = schema;

export const signupSchema = checkSchema({
  name,
  email,
  password,
  confirmPassword,
  phone,
} as Schema);

export const loginSchema = checkSchema({
  email: {
    notEmpty: { errorMessage: 'please fill this field' },
    isEmail: { errorMessage: 'must be a valid email address' },
  },
  password: {
    notEmpty: { errorMessage: 'please fill this field' },
    isString: { errorMessage: 'must be a string value' },
  },
});

export const changePasswordSchema = checkSchema({
  currentPassword: {
    notEmpty: { errorMessage: 'please fill this field' },
    isString: { errorMessage: 'must be a string value' },
    custom: {
      options: async (value: string, { req }: { req: any }) => {
        if (!req.auth || !req.auth.user) throw new Error(`faild to find logged user`);

        const user = await User.findById(req.auth.user._id, { password: 1 });

        if (!user) throw new Error(`faild to find logged user`);

        const isMatch = await user.comparePassword(value);
        if (!isMatch) throw new Error('password does not match');

        return true;
      },
    },
  },
  password,
  confirmPassword,
} as Schema);

export const forgotPasswordSchema = checkSchema({
  email: {
    notEmpty: { errorMessage: 'please fill this field' },
    isEmail: { errorMessage: 'must be a valid email address' },
    custom: {
      options: async (value: string) => {
        const user = await User.findOne({ email: value });
        if (!user) throw new Error('user not found');
        return true;
      },
    },
  },

  forwardTo: {
    optional: true,
    in: ['query'],
    notEmpty: { errorMessage: 'please fill this field' },
    isURL: { errorMessage: 'must be a valid url' },
  },
});

const vrpSchema: Schema = {
  token: {
    in: ['query'],
    optional: true,
    notEmpty: { errorMessage: 'please fill this field' },
    isString: { errorMessage: 'must be a string value' },
  },

  requestId: {
    notEmpty: { errorMessage: 'please fill this field' },
    isString: { errorMessage: 'must be a string value' },
  },

  otp: {
    optional: true,
    notEmpty: { errorMessage: 'please fill this field' },
    isInt: { errorMessage: 'must be a valid integer' },
    isLength: {
      errorMessage: 'otp must be 6 characters',
      options: {
        min: 6,
        max: 6,
      },
    },
  },
};

export const verifyResetPasswordSchema = checkSchema(vrpSchema);

export const resetPasswordSchema = checkSchema({
  ...vrpSchema,
  password,
  confirmPassword,
} as Schema);
