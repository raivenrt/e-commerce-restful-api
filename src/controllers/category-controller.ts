import type { RequestHandler, Request } from 'express';

import Category from '@models/category-model.js';
import { responses } from '@lib/api-response.js';
import pagination from '@lib/pagination.js';

/**
 * Fetch all categories from database
 *
 * @EndPoint /categories GET
 * @ACL Public
 * @ResponseBody {
 * categories: array,
 * itemsCount: number
 * } 200
 */
export const getCategories: RequestHandler = async (req: Request, res) => {
  const categoriesCount = await Category.countDocuments();

  const paginationRes = pagination({
    documentsCount: categoriesCount,
    limit: +req.query.limit!,
    page: +req.query.page!,
  });

  const categories = await Category.find(
    {},
    {},
    { skip: paginationRes.skip, limit: paginationRes.limit },
  );

  responses.success(
    {
      data: categories,
      ...paginationRes,
    },
    res,
    200,
  );
};

/**
 * Create a new category
 *
 * @EndPoint /categories GET
 * @ACL (User, Admin)
 * @Body {name*: string, image?: string} Application/JSON
 * @ResponseBody {data: Category} 201
 */
export const postCategory: RequestHandler = async (req, res) => {
  const category = await Category.create(req.body);

  responses.success({ ...category.toJSON() }, res, 201);
};

/**
 * Get Specific Gategory By Id
 *
 * @EndPoint /categories/:id GET
 * @RouteParams {id: mongoose.Types.ObjectId}
 * @ACL Public
 * @ResponseBody {
 * data: Category
 * } 200
 */
export const getSpecificCategory: RequestHandler = async (req, res) => {
  const categoryId = req.params.id;
  const category = await Category.findById(categoryId);

  responses.success(category, res, 200);
};

/**
 * Update Specific Gategory By Id
 *
 * @EndPoint /categories/:id PUT
 * @RouteParams {id: mongoose.Types.ObjectId}
 * @Body {name*: string} Application/JSON
 * @ACL Private
 * @ResponseBody {
 * data: Category
 * } 200
 */
export const putUpdateSpecificCategory: RequestHandler = async (req, res) => {
  const categoryId = req.params.id;
  const updatedCategory = await Category.findByIdAndUpdate(categoryId, req.body, {
    new: true,
  });

  responses.success(updatedCategory, res, 200);
};

/**
 * Delete Specific Gategory By Id
 *
 * @EndPoint /categories/:id DELETE
 * @RouteParams {id: mongoose.Types.ObjectId}
 * @ACL Private
 * @ResponseBody NO_CONTENT 204
 */
export const deleteSpecificCategory: RequestHandler = async (req, res) => {
  const categoryId = req.params.id;

  await Category.findByIdAndDelete(categoryId);

  responses.success(null, res, 204);
};
