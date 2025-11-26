import type { Document, Model } from 'mongoose';
import type { Request, Response } from 'express';
import ApiQueryFeatures, { type ApiQueryFeaturesOptions } from './api-query-features.js';
import pagination from './pagination.js';
import { responses } from './api-response.js';

/**
 * A class that provides common CRUD (Create, Read, Update, Delete) operations for a given Mongoose model.
 *
 * @template M - The type of the Mongoose document.
 */
export class CRUD<M extends Document> {
  /**
   * Constructs a new `CRUD` instance.
   *
   * @param {Object} options - The options for the CRUD operations.
   * @param {ApiQueryFeaturesOptions<M>} options.apiQueryFeatures - The options for querying the model.
   * @param {Model<M>} options.model - The Mongoose model to perform CRUD operations on.
   * @returns {CRUD<M>} A new `CRUD` instance.
   *
   * @example
   * const crud = new CRUD({
   *   apiQueryFeatures: {
   *     search: { f: 'keyword', fields: ['firstName', 'lastName'] },
   *     sort: { f: 'sort' },
   *     projection: { f: 'select' },
   *     populate: { f: 'populate', ignoreInvalid: true },
   *   },
   *   model: User,
   * });
   *
   * // client-api
   * {
   *   keyword: 'John Doe',
   *   sort: { updatedAt: 'asc', createdAt: '1' },
   *   select: [ 'price', 'category', 'title', '_id' ],
   *   populate: { profile: '*', posts: [ '-__v', '-updatedAt', '-createdAt' ] }
   * }
   */
  constructor(
    public options: {
      apiQueryFeatures: ApiQueryFeaturesOptions<M>;
      model: Model<M>;
    },
  ) {
    this.GET_ALL = this.GET_ALL.bind(this);
    this.POST_CREATE = this.POST_CREATE.bind(this);
    this.GET_SPECIFIC = this.GET_SPECIFIC.bind(this);
    this.DELETE_SPECIFIC = this.DELETE_SPECIFIC.bind(this);
    this.PUT_SPECIFIC = this.PUT_SPECIFIC.bind(this);
  }
  /**
   * Retrieves all documents from the model, applies pagination and filtering based on the request query parameters,
   * and returns the data with pagination information.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  async GET_ALL(req: Request, res: Response) {
    const { filter, projection, queryOptions } = new ApiQueryFeatures<M>(
      this.options.apiQueryFeatures,
      req.query,
    );

    Object.assign(filter, req.filterQuery ?? {});

    const itemsCount = await this.options.model.countDocuments(filter);
    const paginationRes = pagination({
      documentsCount: itemsCount,
      limit: +req.query.limit!,
      page: +req.query.page!,
    });

    queryOptions.skip = paginationRes.skip;
    queryOptions.limit = paginationRes.limit;

    const data = await this.options.model.find(filter, projection, queryOptions);

    responses.success(
      {
        data,
        ...paginationRes,
      },
      res,
      200,
    );
  }
  /**
   * Creates a new document in the model based on the request body and returns the created document.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  async POST_CREATE(req: Request, res: Response) {
    const data = await this.options.model.create(req.body);

    responses.success({ ...data.toJSON() }, res, 201);
  }
  /**
   * Retrieves a specific document from the model based on the document's ID and returns the document.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  async GET_SPECIFIC(req: Request, res: Response) {
    const itemId = req.params.id;
    const item = await this.options.model.findOne({
      _id: itemId,
      ...req.filterQuery,
    });

    responses.success(item, res, 200);
  }
  /**
   * Deletes a specific document from the model based on the document's ID.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  async DELETE_SPECIFIC(req: Request, res: Response) {
    const itemId = req.params.id;

    const deletedItem = await this.options.model.findOneAndDelete({
      _id: itemId,
      ...req.filterQuery,
    });

    responses.success(null, res, 204);
  }
  /**
   * Updates a specific document in the model based on the document's ID and the request body, and returns the updated document.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  async PUT_SPECIFIC(req: Request, res: Response) {
    const itemId = req.params.id;
    const item = await this.options.model.findOneAndUpdate(
      {
        _id: itemId,
        ...req.filterQuery,
      },
      req.body,
      {
        new: true,
      },
    );

    responses.success(item, res, 200);
  }
}
