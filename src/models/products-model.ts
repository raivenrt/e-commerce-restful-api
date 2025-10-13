import { Document, model, Schema } from 'mongoose';

interface IProduct {
  title: string;
  description: string;

  slug: string;

  qunatity: number;
  sold: number;

  price: number;
  priceAfterDiscount?: number;

  colors?: string[];

  images?: string[];
  imageCover: string;

  category: Schema.Types.ObjectId;

  subcategory?: Schema.Types.ObjectId;
  brand?: Schema.Types.ObjectId;

  ratingsAverage?: number;
  ratingQuantity: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDocument extends IProduct, Document {}

const productSchema = new Schema<ProductDocument>(
  {
    title: {
      type: String,
      required: [true, 'please fill this field'],
      trim: true,
      minLength: [3, 'too short'],
      maxLength: [128, 'too long'],
    },
    slug: {
      type: String,
      required: [true, 'please fill this field'],
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'please fill this field'],
      minLength: [20, 'too short'],
      maxLength: [512, 'too long'],
    },
    qunatity: {
      type: Number,
      required: [true, 'please fill this field'],
      min: 0,
    },
    sold: {
      type: Number,
      min: 0,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'please fill this field'],
      min: 0,
    },
    priceAfterDiscount: {
      type: Number,
      min: 0,
    },
    colors: [String],
    images: [String],
    imageCover: {
      type: String,
      required: [true, 'please fill this field'],
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: 'category',
      required: [true, 'must be belong to category'],
    },

    subcategory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'subcategory',
      },
    ],

    brand: {
      type: Schema.Types.ObjectId,
      ref: 'brand',
    },

    ratingsAverage: {
      type: Number,
      min: [1, 'must be above or equal 1.0'],
      max: [5, 'must be below or equal 5.0'],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Product = model<ProductDocument>('product', productSchema);

export default Product;
