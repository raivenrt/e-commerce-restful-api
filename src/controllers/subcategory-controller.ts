import type { RequestHandler } from 'express';

import SubCategory from '@models/subcategory-model.js';
import { CRUD } from '../lib/crud.js';

const operations = new CRUD({
  model: SubCategory,
  apiQueryFeatures: {
    search: { f: 'keyword', fields: ['name'] },
    sort: { f: 'sort' },
    projection: { f: 'select' },
    populate: { f: 'populate', ignoreInvalid: true },
  },
});

/**
 * Fetch all subcategories from database
 *
 * @route `(/subcategories, /:categoryId/subcategories)` GET
 * @acl -
 * @response JSEND 200
 * @query? `
 * {
 *   keyword: 'Mob',
 *   sort: { createdAt: '1' },
 *   select: [ 'name' ],
 *   populate: { category: '*' }
 * }
 * `
 */
export const getSubCategories: RequestHandler = operations.GET_ALL;

/**
 * Create a new subcategory
 *
 * @route `(/subcategories, /:categoryId/subcategories)` POST
 * @acl -
 * @body `{ name*: string, category*: Category.ObjectId, slug?: string }` Application/JSON
 * @response JSEND 201
 */
export const postSubCategory: RequestHandler = operations.POST_CREATE;

/**
 * Fetch Specific SubCategory By Id
 *
 * @route `(/subcategories/:id, /:categoryId/subcategories/:id)` GET
 * @acl -
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const getSpecificSubCategory: RequestHandler = operations.GET_SPECIFIC;

/**
 * Update Specific SubCategory By Id
 *
 * @route `(/subcategories/:id, /:categoryId/subcategories/:id)` `PUT`
 * @acl -
 * @body { name?: string, category?: Category.ObjectId, slug?: string } `Application/JSON`
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const putUpdateSpecificSubCategory: RequestHandler = operations.PUT_SPECIFIC;

/**
 * Delete Specific SubCategory By Id
 *
 * @route `(/subcategories/:id, /:categoryId/subcategories/:id)` `DELETE`
 * @acl -
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response NO_CONTENT 204
 */
export const deleteSpecificSubCategory: RequestHandler = operations.DELETE_SPECIFIC;
