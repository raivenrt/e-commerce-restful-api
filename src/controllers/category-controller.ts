import type { RequestHandler } from 'express';

import Category from '@models/category-model.js';
import { CRUD } from '../lib/crud.js';

const operations = new CRUD({
  model: Category,
  apiQueryFeatures: {
    search: { f: 'keyword', fields: ['name'] },
    sort: { f: 'sort' },
    projection: { f: 'select' },
  },
});

/**
 * Fetch all categories from database
 *
 * @route `(/categories)` GET
 * @acl -
 * @response JSEND 200
 * @query? `
 * {
 *   keyword: 'Elec',
 *   sort: { createdAt: '1' },
 *   select: [ 'name' ],
 * }
 * `
 */
export const getCategories: RequestHandler = operations.GET_ALL;

/**
 * Create a new category
 *
 * @route `(/categories)` POST
 * @acl -
 * @body `{ name*: string, image?: string (URL, Path), slug?: string }` Application/JSON
 * @response JSEND 201
 */
export const postCategory: RequestHandler = operations.POST_CREATE;

/**
 * Fetch Specific category By Id
 *
 * @route `(/categories/:id)` GET
 * @acl -
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const getSpecificCategory: RequestHandler = operations.GET_SPECIFIC;

/**
 * Update Specific category By Id
 *
 * @route `(/categories/:id)` `PUT`
 * @acl -
 * @body { name?: string, image?: string (URL, Path), slug?: string } `Application/JSON`
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const putUpdateSpecificCategory: RequestHandler = operations.PUT_SPECIFIC;

/**
 * Delete Specific category By Id
 *
 * @route `(/categories/:id)` `DELETE`
 * @acl -
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response NO_CONTENT 204
 */
export const deleteSpecificCategory: RequestHandler = operations.DELETE_SPECIFIC;
