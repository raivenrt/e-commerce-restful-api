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
      ref: 'product',
      required: [true, 'please fill this field.'],
    },
  },
  {
    timestamps: true,
  },
);
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        ratingQuantity: { $sum: 1 },
        avgRatings: { $avg: '$ratings' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingQuantity: stats[0].ratingQuantity,
      ratingsAverage: stats[0].avgRatings,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.pre(/^(find|findOne)$/, function (next) {
  (this as any).populate({ path: 'user', select: 'name avatar email -_id' });
  next();
});

reviewSchema.post(/^(create|findOneAndUpdate|findOneAndDelete)$/, async function (doc) {
  const ReviewModel = model('review');
  await (ReviewModel as any).calcAverageRatings(doc.product);
});

const Review = model<ReviewDocument>('review', reviewSchema);

export default Review;
