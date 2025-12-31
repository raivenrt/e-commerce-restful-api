import { Document, Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
  mongoosePostDeleteMiddleware,
  mongoosePreUpdateMiddleware,
} from '@middlewares/upload.js';

export const enum UserRoles {
  USER,
  ADMIN,
  MANAGER,
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role?: UserRoles;
  passwordChangedAt?: Date;
}

export interface UserDocument extends IUser, Document {
  comparePassword(password: string): Promise<boolean>;
  generateJWTToken(): Promise<string>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: [true, 'please fill this field.'],
      minlength: [2, 'too short'],
      maxlength: [128, 'too long'],
    },
    email: {
      type: String,
      required: [true, 'please fill this field.'],
      unique: [true, 'already exists'],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'please fill this field.'],
      minLength: [6, 'too short'],
      maxLength: [256, 'too long'],
      set: (v: string) =>
        bcrypt.hashSync(
          `${process.env.HASH_SECRET}${v}`,
          Number(process.env.HASH_ROUNDS),
        ),
    },
    phone: String,
    avatar: String,
    passwordChangedAt: Date,
    role: {
      type: Number,
      enum: [UserRoles.USER, UserRoles.ADMIN],
      default: UserRoles.USER,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.comparePassword = async function (
  this: UserDocument,
  password: string,
) {
  console.log(password, this.password);
  const isMatch = await bcrypt.compare(
    `${process.env.HASH_SECRET!}${password}`,
    this.password,
  );

  return isMatch;
};

userSchema.methods.generateJWTToken = function (this: UserDocument) {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN! as any,
    issuer: process.env.JWT_ISSUER,
    audience: 'auth',
  });

  return token;
};

userSchema.post('findOneAndDelete', mongoosePostDeleteMiddleware);
userSchema.pre('findOneAndUpdate', mongoosePreUpdateMiddleware);

userSchema.pre('findOneAndUpdate', function () {
  const updates = (this as any).getUpdate();
  if (updates?.password) updates.passwordChangedAt = new Date();
});

const User = model<UserDocument>('user', userSchema);

export default User;
