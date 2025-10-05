import Category from '@models/category-model.js';

import type { RequestHandler } from 'express';
import slugify from '@lib/slugify.js';

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
export const getCategories: RequestHandler = async (req, res) => {
  const categories = await Category.find(
    {},
    {
      __v: false,
    },
  );

  const categoriesLen = categories.length;

  res.status(200).json({
    categories,
    itemsCount: categoriesLen,
  });
};

/**
 * Create a new category
 *
 * @EndPoint /categories GET
 * @ACL (User, Admin)
 * @Body {name*: string, image?: string} Application/JSON
 * @ResponseBody Category 201
 */
export const postCategory: RequestHandler = async (req, res) => {
  const category = await Category.create({
    ...req.body,
    slug: slugify(req.body.name),
  });

  res.status(201).json(category);
};
