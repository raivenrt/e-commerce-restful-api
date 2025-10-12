import { model, Schema, type Document } from 'mongoose';

interface IBrand {
  name: string;
  slug: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BrandDocument extends IBrand, Document {}

const brandSchema = new Schema<BrandDocument>(
  {
    name: {
      type: String,
      required: [true, 'please fill this field'],
      unique: [true, 'already exists'],
      minlength: [3, 'too short'],
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
