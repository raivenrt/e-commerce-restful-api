import type { RequestHandler, Request } from 'express';

import Product, { type IProduct } from '@models/products-model.js';
import { responses } from '@lib/api-response.js';
import pagination from '@lib/pagination.js';

import ApiQueryFeatures from '../lib/api-query-features.js';

/**
 * Fetch all products from database
 *
 * @EndPoint /products `GET`
 * @ACL Public
 * @ResponseBody `JSEND` 200
 */

export const getProducts: RequestHandler = async (req: Request, res) => {
  const { filter, projection, queryOptions } = new ApiQueryFeatures<IProduct>(
    {
      search: { f: 'keyword', fields: ['title', 'description'] },
      sort: { f: 'sort' },
      projection: { f: 'select' },
      populate: { f: 'populate', execlude: ['brand'], ignoreInvalid: true },
    },
    req.query,
  );

  const productsCount = await Product.countDocuments(filter);
  const paginationRes = pagination({
    documentsCount: productsCount,
    limit: +req.query.limit!,
    page: +req.query.page!,
  });

  queryOptions.skip = paginationRes.skip;
  queryOptions.limit = paginationRes.limit;

  const products = await Product.find(filter, projection, queryOptions);

  responses.success(
    {
      data: products,
      ...paginationRes,
    },
    res,
    200,
  );
};

/**
 * Create a new product
 *
 * @EndPoint /products `POST`
 * @ACL (User, Admin)
 * @Body {
 *   title*: string,
 *   description*: string,
 *   slug*: string,
 *   qunatity*: number,
 *   price*: number,
 *   imageCover*: string,
 *   category*: ObjectId,
 *   priceAfterDiscount?: number,
 *   colors?: string[],
 *   images?: string[],
 *   subcategory?: ObjectId[],
 *   brand?: ObjectId
 * } `Application/JSON`
 * @ResponseBody `JSEND` 201
 */
export const postProduct: RequestHandler = async (req, res) => {
  const product = await Product.create(req.body);

  responses.success({ ...product.toJSON() }, res, 201);
};

/**
 * Get Specific product By Id
 *
 * @EndPoint /products/:id `GET`
 * @RouteParams {id: mongoose.Types.ObjectId}
 * @ACL Public
 * @ResponseBody `JSEND` 200
 */
export const getSpecificProduct: RequestHandler = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);

  responses.success(product, res, 200);
};

/**
 * Update Specific product By Id
 *
 * @EndPoint /products/:id `PUT`
 * @RouteParams {id: mongoose.Types.ObjectId}
 * @Body {
 *   title?: string,
 *   description?: string,
 *   slug?: string,
 *   qunatity?: number,
 *   price?: number,
 *   imageCover?: string,
 *   category?: ObjectId,
 *   priceAfterDiscount?: number,
 *   colors?: string[],
 *   images?: string[],
 *   subcategory?: ObjectId[],
 *   brand?: ObjectId
 * } `Application/JSON`
 * @ACL Private
 * @ResponseBody `JSEND` 200
 */
export const putUpdateSpecificProduct: RequestHandler = async (req, res) => {
  const productId = req.params.id;
  const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, {
    new: true,
  });

  responses.success(updatedProduct, res, 200);
};

/**
 * Delete Specific product By Id
 *
 * @EndPoint /products/:id `DELETE`
 * @RouteParams {id: mongoose.Types.ObjectId}
 * @ACL Private
 * @ResponseBody `NO_CONTENT` 204
 */
export const deleteSpecificProduct: RequestHandler = async (req, res) => {
  const productId = req.params.id;

  await Product.findByIdAndDelete(productId);

  responses.success(null, res, 204);
};
