import type { RequestHandler } from 'express';

import pagination from '@lib/pagination.js';
import { responses } from '@lib/api-response.js';
import SubCategory from '@models/subcategory-model.js';

/**
 * Fetch all subcategories from database
 *
 * @EndPoint /subcategories GET
 * @ACL Public
 * @ResponseBody JSEND 200
 */
export const getSubCategories: RequestHandler = async (req, res) => {
  const filter: { category?: string } = req.filterQuery ?? {};

  const subCategoriesCount = await SubCategory.countDocuments(filter);

  const paginationRes = pagination({
    documentsCount: subCategoriesCount,
    limit: +req.query.limit!,
    page: +req.query.page!,
  });

  const subcategories = await SubCategory.find(
    filter,
    {},
    {
      skip: paginationRes.skip,
      limit: paginationRes.limit,
      populate: { path: 'category', select: { name: true, slug: true, _id: true } },
    },
  );

  responses.success(
    {
      data: subcategories,
      ...paginationRes,
    },
    res,
    200,
  );
};

/**
 * Create a new SubCategory
 *
 * @EndPoint /subcategories post
 * @ACL (User, Admin)
 * @Body {name*: string, category*: string} Application/JSON
 * @ResponseBody JSEND 201
 */
export const postSubCategory: RequestHandler = async (req, res) => {
  const subcategory = await SubCategory.create(req.body);

  responses.success({ ...subcategory.toJSON() }, res, 201);
};

/**
 * Get Specific SubCategory By Id
 *
 * @EndPoint /subcategories/:id GET
 * @RouteParams {id: mongoose.Types.ObjectId}
 * @ACL Public
 * @ResponseBody JSEND 200
 */
export const getSpecificSubCategory: RequestHandler = async (req, res) => {
  const filter: { category?: string } = req.filterQuery ?? {};
  const subcategory = await SubCategory.findOne(
    { ...filter, _id: req.params.id },
    {},
    {
      populate: { path: 'category', select: { name: true, slug: true, _id: true } },
    },
  );

  responses.success(subcategory, res, 200);
};

/**
 * Update Specific SubCategory By Id
 *
 * @EndPoint /subcategories/:id PUT
 * @RouteParams {id: mongoose.Types.ObjectId}
 * @Body {name?: string, category?: mongoose.Types.ObjectId} Application/JSON
 * @ACL Private
 * @ResponseBody JSEND 200
 */
export const putUpdateSpecificSubCategory: RequestHandler = async (req, res) => {
  const subcategoryId = req.params.id;
  const updatedSubcategory = await SubCategory.findByIdAndUpdate(
    subcategoryId,
    req.body,
    {
      new: true,
    },
  );

  responses.success(updatedSubcategory, res, 200);
};

/**
 * Delete Specific SubCategory By Id
 *
 * @EndPoint /subcategories/:id DELETE
 * @RouteParams {id: mongoose.Types.ObjectId}
 * @ACL Private
 * @ResponseBody NO_CONTENT 204
 */
export const deleteSpecificSubCategory: RequestHandler = async (req, res) => {
  const subcategoryId = req.params.id;

  await SubCategory.findByIdAndDelete(subcategoryId);

  responses.success(null, res, 204);
};
