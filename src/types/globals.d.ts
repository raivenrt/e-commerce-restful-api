import 'express';
import type { FilterQuery } from 'mongoose';

declare module 'express-serve-static-core' {
  interface Request {
    filterQuery?: FilterQuery<Document>;
  }
}
