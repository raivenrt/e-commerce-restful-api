import type { RequestHandler } from 'express';

import Review from '@models/review-model.js';
import { CRUD } from '../lib/crud.js';

const operations = new CRUD({
  model: Review,
  apiQueryFeatures: {
    search: { f: 'keyword', fields: ['description'] },
    sort: { f: 'sort' },
    projection: { f: 'select' },
  },
});

/**
 * Fetch all reviews from database
 *
 * @route `(/reviews)` GET
 * @acl Any
 * @response JSEND 200
 * @query? `
 * {
 *   keyword: 'App',
 *   sort: { createdAt: '1' },
 *   select: [ 'name' ],
 * }
 * `
 */
export const getReviews: RequestHandler = operations.GET_ALL;

/**
 * Create a new review
 *
 * @route `(/reviews)` POST
 * @acl User
 * @body `{ title: string, ratings: 1-5, user: Types.ObjectId, product: Types.ObjectId }` Application/JSON
 * @response JSEND 201
 */
export const postReview: RequestHandler = operations.POST_CREATE;

/**
 * Fetch Specific review By Id
 *
 * @route `(/reviews/:id)` GET
 * @acl Any
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const getSpecificReview: RequestHandler = operations.GET_SPECIFIC;

/**
 * Update Specific review By Id
 *
 * @route `(/reviews/:id)` `PUT`
 * @acl User
 * @body { title?: string, ratings?: 1-5, user?: Types.ObjectId, product?: Types.ObjectId } `Application/JSON`
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const putUpdateSpecificReview: RequestHandler = operations.PUT_SPECIFIC;

/**
 * Delete Specific Review By Id
 *
 * @route `(/reviews/:id)` `DELETE`
 * @acl (User, Admin, Manager)
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response NO_CONTENT 204
 */
export const deleteSpecificReviews: RequestHandler = operations.DELETE_SPECIFIC;
