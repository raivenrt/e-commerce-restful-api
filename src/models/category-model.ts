import { Document, model, Schema } from 'mongoose';

export interface ICategory {
  name: string;
  slug?: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryDocument extends ICategory, Document {}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'please fill this field.'],
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
  {
    timestamps: true,
  },
);

const Category = model<CategoryDocument>('category', categorySchema);

export default Category;
