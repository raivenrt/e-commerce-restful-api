import type { RequestHandler } from 'express';

import Product from '@models/products-model.js';
import { CRUD } from '../lib/crud.js';

const operations = new CRUD({
  model: Product,
  apiQueryFeatures: {
    search: { f: 'keyword', fields: ['title', 'description'] },
    sort: { f: 'sort' },
    projection: { f: 'select' },
    populate: { f: 'populate', ignoreInvalid: true },
  },
});

/**
 * Fetch all products from database
 *
 * @route `(/products)` GET
 * @acl -
 * @response JSEND 200
 * @query? `
 * {
 *   keyword: 'Shirt',
 *   sort: { price: 'asc', createdAt: '1' },
 *   select: [ 'price', 'category', 'title', '_id' ],
 *   populate: { brand: '*', category: [ '-__v', '-updatedAt', '-createdAt' ], subcategories: [ '-__v', '-updatedAt', '-createdAt' ] }
 * }
 * `
 */
export const getProducts: RequestHandler = operations.GET_ALL;

/**
 * Create a new brand
 *
 * @route `(/brands)` POST
 * @acl -
 * @body `{
 *  title*: string,
 *  slug*: string,
 *  description*: string,
 *  qunatity*: number,
 *  sold?: number,
 *  price*: number,
 *  priceAfterDiscount?: number,
 *  colors?: string[],
 *  images?: string[],
 *  imageCover*: string,
 *  category*: Category.ObjectId,
 *  subcategories?: SubCategory.ObjectId[],
 *  brand?: Brand.ObjectId
 *  ratingsAverage?: number,
 *  ratingQuantity?: number
 * }` Application/JSON
 * @response JSEND 201
 */
export const postProduct: RequestHandler = operations.POST_CREATE;

/**
 * Fetch Specific product By Id
 *
 * @route `(/products/:id)` GET
 * @acl -
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const getSpecificProduct: RequestHandler = operations.GET_SPECIFIC;

/**
 * Update Specific product By Id
 *
 * @route `(/products/:id)` `PUT`
 * @acl -
 * @body `{
 *  title?: string,
 *  slug?: string,
 *  description?: string,
 *  qunatity?: number,
 *  sold?: number,
 *  price?: number,
 *  priceAfterDiscount?: number,
 *  colors?: string[],
 *  images?: string[],
 *  imageCover?: string,
 *  category?: Category.ObjectId,
 *  subcategories?: SubCategory.ObjectId[],
 *  brand?: Brand.ObjectId
 *  ratingsAverage?: number,
 *  ratingQuantity?: number
 * }` Application/JSON
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response JSEND 200
 */
export const putUpdateSpecificProduct: RequestHandler = operations.PUT_SPECIFIC;

/**
 * Delete Specific products By Id
 *
 * @route `(/products/:id)` `DELETE`
 * @acl -
 * @params `{ id: mongoose.Types.ObjectId }`
 * @response NO_CONTENT 204
 */
export const deleteSpecificProduct: RequestHandler = operations.DELETE_SPECIFIC;
