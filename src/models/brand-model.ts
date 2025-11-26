import { model, Schema, type Document } from 'mongoose';

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
    image: String,
  },
  { timestamps: true },
);

const Brand = model<BrandDocument>('brand', brandSchema);

export default Brand;
