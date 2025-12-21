import { Document, model, Schema } from 'mongoose';
import Category, { type CategoryDocument } from '@models/category-model.js';
import {
  mongoosePostDeleteMiddleware,
  mongoosePreUpdateMiddleware,
} from '@middlewares/upload.js';

export interface ISubCategory {
  name: string;
  slug?: string;
  category: Schema.Types.ObjectId | CategoryDocument;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubCategoryDocument extends ISubCategory, Document {}

export const subcategorySchema = new Schema<SubCategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'please fill this field.'],
      unique: [true, 'already exists'],
      minlength: [2, 'too short'],
      maxlength: [32, 'too long'],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: Category.modelName,
      required: [true, 'must be belongs to parent category'],
    },
  },
  { timestamps: true },
);

subcategorySchema.post('findOneAndDelete', mongoosePostDeleteMiddleware);
subcategorySchema.pre('findOneAndUpdate', mongoosePreUpdateMiddleware);

const SubCategory = model<SubCategoryDocument>('subcategory', subcategorySchema);

export default SubCategory;
