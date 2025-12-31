import 'express';
import type { FilterQuery } from 'mongoose';
import type { UserDocument } from '@models/user-model.ts';

declare module 'express-serve-static-core' {
  interface Request {
    filterQuery?: FilterQuery<Document>;
    hasFiles?: boolean;
    auth?: {
      token: string;
      user: UserDocument;
    };
  }
}
