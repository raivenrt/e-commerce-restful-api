import { Document, Schema, Types, model } from 'mongoose';
import User, { type UserDocument } from '@models/user-model.js';
import type { ProductDocument } from './products-model.js';
import Product from './products-model.js';

export interface IReview {
  description?: string;
  ratings: number;
  user: UserDocument | Types.ObjectId;
  product: ProductDocument | Types.ObjectId;
}

export interface ReviewDocument extends IReview, Document {}

const reviewSchema = new Schema<ReviewDocument>(
  {
    description: {
      type: String,
      maxLength: [256, 'maximum length is 256 characters'],
    },
    ratings: {
      type: Number,
      required: [true, 'please fill this field.'],
      min: [1, 'minimum rating is 1.0'],
      max: [5, 'maximum rating is 5.0'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: [true, 'please fill this field.'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: Product,
      required: [true, 'please fill this field.'],
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.pre(/^(find|findOne)$/, function (next) {
  (this as any).populate({ path: 'user', select: 'name avatar email -_id' });
  next();
});

const Review = model<ReviewDocument>('review', reviewSchema);

export default Review;
