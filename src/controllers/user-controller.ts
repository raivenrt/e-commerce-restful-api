import type { RequestHandler } from 'express';

import User from '@models/user-model.js';
import { CRUD } from '@lib/crud.js';

const operations = new CRUD({
  model: User,
  apiQueryFeatures: {
    search: { f: 'keyword', fields: ['name', 'email', 'phone'] },
    sort: { f: 'sort' },
    projection: { f: 'select' },
  },
});

/**
 * Fetch all users from database
 *
 * @route `(/users)` GET
 * @acl -
 * @response JSEND 200
 * @query? `
 * {
 *   keyword: 'john_doe@',
 *   sort: { createdAt: '1' },
 *   select: [ 'name' ],
 * }
 * `
 */
export const getUsers: RequestHandler = operations.GET_ALL;

/**
 * Create a new user
 *
 * @route `(/users)` POST
 * @acl -
 * @body `{ name: string, email: string, password: string }` Application/JSON
 * @response JSEND 201
 */
export const postCreateUser: RequestHandler = operations.POST_CREATE;

/**
 * Fetch Specific user By Id
 *
 * @route `(/users/:id)` GET
 * @acl -
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const getSpecificUser: RequestHandler = operations.GET_SPECIFIC;

/**
 * Update Specific user By Id
 *
 * @route `(/users/:id)` `PUT`
 * @acl -
 * @body { name?: string, image?: string (URL, Path), slug?: string } `Application/JSON`
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const putUpdateSpecificUser: RequestHandler = operations.PUT_SPECIFIC;

/**
 * Delete Specific user By Id
 *
 * @route `(/users/:id)` `DELETE`
 * @acl -
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response NO_CONTENT 204
 */
export const deleteSpecificUser: RequestHandler = operations.DELETE_SPECIFIC;
