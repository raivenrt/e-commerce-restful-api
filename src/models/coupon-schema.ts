import { model, Schema, type Document } from 'mongoose';

export interface ICoupon {
  name: string;
  expiresAt: Date;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponDocument extends ICoupon, Document {}

export const couponSchema = new Schema<CouponDocument>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'please fill this field'],
      unique: [true, 'already exists'],
      minlength: [2, 'too short'],
      maxlength: [75, 'too long'],
    },
    expiresAt: {
      type: Date,
      expires: 1,
    },
    discount: {
      type: Number,
      required: [true, 'please fill this field'],
    },
  },
  { timestamps: true },
);

const Coupon = model<CouponDocument>('coupon', couponSchema);

export default Coupon;
