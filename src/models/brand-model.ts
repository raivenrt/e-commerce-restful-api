import { model, Schema, type Document } from 'mongoose';
import {
  mongoosePostDeleteMiddleware,
  mongoosePreUpdateMiddleware,
} from '@middlewares/upload.js';

export interface IBrand {
  name: string;
  slug: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandDocument extends IBrand, Document {}

export const brandSchema = new Schema<BrandDocument>(
  {
    name: {
      type: String,
      required: [true, 'please fill this field'],
      unique: [true, 'already exists'],
      minlength: [2, 'too short'],
      maxlength: [32, 'too long'],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);

brandSchema.post('findOneAndDelete', mongoosePostDeleteMiddleware);
brandSchema.pre('findOneAndUpdate', mongoosePreUpdateMiddleware);

const Brand = model<BrandDocument>('brand', brandSchema);

export default Brand;
