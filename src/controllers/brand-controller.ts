import type { RequestHandler } from 'express';

import Brand from '@models/brand-model.js';
import { CRUD } from '../lib/crud.js';

const operations = new CRUD({
  model: Brand,
  apiQueryFeatures: {
    search: { f: 'keyword', fields: ['name'] },
    sort: { f: 'sort' },
    projection: { f: 'select' },
  },
});

/**
 * Fetch all brands from database
 *
 * @route `(/brands)` GET
 * @acl -
 * @response JSEND 200
 * @query? `
 * {
 *   keyword: 'App',
 *   sort: { createdAt: '1' },
 *   select: [ 'name' ],
 * }
 * `
 */
export const getBrands: RequestHandler = operations.GET_ALL;

/**
 * Create a new brand
 *
 * @route `(/brands)` POST
 * @acl -
 * @body `{ name*: string, image?: string (URL, Path), slug?: string }` Application/JSON
 * @response JSEND 201
 */
export const postBrand: RequestHandler = operations.POST_CREATE;

/**
 * Fetch Specific brand By Id
 *
 * @route `(/brands/:id)` GET
 * @acl -
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const getSpecificBrand: RequestHandler = operations.GET_SPECIFIC;

/**
 * Update Specific brand By Id
 *
 * @route `(/brands/:id)` `PUT`
 * @acl -
 * @body { name?: string, image?: string (URL, Path), slug?: string } `Application/JSON`
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const putUpdateSpecificBrand: RequestHandler = operations.PUT_SPECIFIC;

/**
 * Delete Specific brand By Id
 *
 * @route `(/brands/:id)` `DELETE`
 * @acl -
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response NO_CONTENT 204
 */
export const deleteSpecificBrand: RequestHandler = operations.DELETE_SPECIFIC;
