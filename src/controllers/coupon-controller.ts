import type { RequestHandler } from 'express';

import { CRUD } from '../lib/crud.js';
import Coupon from '@models/coupon-schema.js';

const operations = new CRUD({
  model: Coupon,
  apiQueryFeatures: {
    search: { f: 'keyword', fields: ['name'] },
    sort: { f: 'sort' },
    projection: { f: 'select' },
  },
});

/**
 * Get list of coupons
 *
 * @route `(/coupons)` GET
 * @acl (Admin, Manager)
 * @response JSEND 200
 * @query? `
 * {
 *   keyword: 'App',
 *   sort: { createdAt: '1' },
 *   select: [ 'name' ],
 * }
 * `
 */
export const getCoupons: RequestHandler = operations.GET_ALL;

/**
 * Create a new Coupon
 *
 * @route `(/coupons)` POST
 * @acl (Admin, Manager)
 * @body `{
    name: string;
    expiresAt: Date;
    discount: number;
  }` `Application/JSON`
 * @response JSEND 201
 */
export const postCreateCoupon: RequestHandler = operations.POST_CREATE;

/**
 * Fetch Specific coupon By Id
 *
 * @route `(/coupons/:id)` GET
 * @acl (Admin, Manager)
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const getSpecificCoupon: RequestHandler = operations.GET_SPECIFIC;

/**
 * Update Specific coupon By Id
 *
 * @route `(/coupons/:id)` `PUT`
 * @acl (Admin, Manager)
 * @body {
    name?: string;
    expiresAt?: Date;
    discount?: number;
  } `Application/JSON`
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const putUpdateSpecificCoupon: RequestHandler = operations.PUT_SPECIFIC;

/**
 * Delete Specific coupon By Id
 *
 * @route `(/coupons/:id)` `DELETE`
 * @acl (Admin, Manager)
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response NO_CONTENT 204
 */
export const deleteSpecificCoupon: RequestHandler = operations.DELETE_SPECIFIC;
