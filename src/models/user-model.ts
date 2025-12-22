import { Document, Schema, model } from 'mongoose';
import {
  mongoosePostDeleteMiddleware,
  mongoosePreUpdateMiddleware,
} from '@middlewares/upload.js';
import bcrypt from 'bcryptjs';

export const enum UserRoles {
  USER,
  ADMIN,
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role?: UserRoles;
}

export interface UserDocument extends IUser, Document {
  comparePassword(password: string): Promise<boolean>;
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
          `${process.env.HASH_SECRET ?? ''}${v}`,
          Number(process.env.HASH_SALT) ?? 10,
        ),
    },
    phone: String,
    avatar: String,
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
  const isMatch = await bcrypt.compare(
    `${process.env.HASH_SECRET ?? ''}${password}`,
    this.password,
  );

  return isMatch;
};

userSchema.post('findOneAndDelete', mongoosePostDeleteMiddleware);
userSchema.pre('findOneAndUpdate', mongoosePreUpdateMiddleware);

const User = model<UserDocument>('user', userSchema);

export default User;
