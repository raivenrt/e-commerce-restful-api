import { Document, Schema, Types, model } from 'mongoose';
import { type Request } from 'express';
import User, { type UserDocument } from '@models/user-model.js';
import bcrypt from 'bcryptjs';

export interface IToken {
  uid: Types.ObjectId | UserDocument;
  token: string;
  otp: string;
  email: string;
  requestId: string;
  client: {
    ip: string;
    agent: string;
  };
  createdAt: Date;
}

export interface TokenDocument extends IToken, Document {
  compare(otp: string, token: string): Promise<{ token: boolean; otp: boolean }>;
}

const tokenSchema = new Schema<TokenDocument>(
  {
    uid: {
      type: Types.ObjectId,
      ref: User,
      required: [true, 'please fill this field.'],
    },

    email: {
      type: String,
      required: [true, 'please fill this field.'],
    },
    token: {
      type: String,
      required: [true, 'please fill this field.'],
    },

    otp: {
      type: String,
      required: [true, 'please fill this field.'],
    },

    requestId: {
      type: String,
      required: [true, 'please fill this field.'],
      unique: [true, 'already exists'],
    },
    client: {
      type: {
        ip: {
          type: String,
          required: [true, 'please fill this field.'],
        },

        agent: {
          type: String,
          required: [true, 'please fill this field.'],
        },
      },
      required: [true, 'please fill this field.'],
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: 600 }, // 10 minutes
    },
  },
  {
    timestamps: true,
  },
);

tokenSchema.methods.compare = async function (otp?: string, token?: string) {
  const isValid = {
    token: token ? await bcrypt.compare(token, this.token) : false,
    otp: otp ? await bcrypt.compare(otp, this.otp) : false,
  };
  return isValid;
};

const Token = model<TokenDocument>('token', tokenSchema);

export default Token;
