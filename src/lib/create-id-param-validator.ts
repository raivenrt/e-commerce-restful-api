import { checkSchema } from 'express-validator';
import type { Document, Model } from 'mongoose';

export type createIdParamValidatorOptions<F extends Document = any> = {
  model: Model<F>;
  field?: string;
};

export default function createIdParamValidator(options: createIdParamValidatorOptions) {
  return checkSchema({
    [options.field ?? 'id']: {
      in: ['params'],
      notEmpty: { errorMessage: 'must be not empty' },
      isMongoId: { errorMessage: 'Invalid format' },
      custom: {
        options: async (value: string) => {
          const product = await options.model.findById(value);

          if (!product)
            throw new Error(`No ${options.model.modelName} exists with this id ${value}`);

          return true;
        },
      },
    },
  });
}
