import Category from '@models/category-model.js';

import type { RequestHandler, Request } from 'express';
import slugify from '@lib/slugify.js';
import { responses } from '@lib/api-response.js';

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
  const categories = await Category.find();
  responses.success({ categories, count: categories.length }, res);
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
  const category = await Category.create({
    ...req.body,
    slug: slugify(req.body.name),
  });

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

  if (!category)
    return responses.failed(
      { id: `No category exists with this id ${categoryId}` },
      res,
      404,
    );

  responses.success({ ...category.toJSON() }, res, 200);
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
  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    {
      name: req.body.name,
      slug: slugify(req.body.name),
    },
    {
      new: true,
    },
  );

  if (!updatedCategory)
    return responses.failed(
      { id: `No category exists with this id ${categoryId}` },
      res,
      404,
    );

  responses.success({ ...updatedCategory.toJSON() }, res, 200);
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
  const category = await Category.findByIdAndDelete(categoryId);

  if (!category)
    return responses.failed(
      { id: `No category exists with this id ${categoryId}` },
      res,
      404,
    );

  responses.success(null, res, 204);
};
