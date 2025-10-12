import type { RequestHandler, Request } from 'express';

import Brand from '@models/brand-model.js';
import { responses } from '@lib/api-response.js';
import pagination from '@lib/pagination.js';

/**
 * Fetch all brands from database
 *
 * @EndPoint /brands `GET`
 * @ACL Public
 * @ResponseBody `JSEND` 200
 */
export const getBrands: RequestHandler = async (req: Request, res) => {
  const brandsCount = await Brand.countDocuments();

  const paginationRes = pagination({
    documentsCount: brandsCount,
    limit: +req.query.limit!,
    page: +req.query.page!,
  });

  const brands = await Brand.find(
    {},
    {},
    { skip: paginationRes.skip, limit: paginationRes.limit },
  );

  responses.success(
    {
      data: brands,
      ...paginationRes,
    },
    res,
    200,
  );
};

/**
 * Create a new brand
 *
 * @EndPoint /brands `POST`
 * @ACL (User, Admin)
 * @Body {name*: string, image?: string} `Application/JSON`
 * @ResponseBody `JSEND` 201
 */
export const postBrand: RequestHandler = async (req, res) => {
  const brand = await Brand.create(req.body);

  responses.success({ ...brand.toJSON() }, res, 201);
};

/**
 * Get Specific Brand By Id
 *
 * @EndPoint /brands/:id `GET`
 * @RouteParams {id: mongoose.Types.ObjectId}
 * @ACL Public
 * @ResponseBody `JSEND` 200
 */
export const getSpecificBrand: RequestHandler = async (req, res) => {
  const brandId = req.params.id;
  const brand = await Brand.findById(brandId);

  responses.success(brand, res, 200);
};

/**
 * Update Specific Brand By Id
 *
 * @EndPoint /brands/:id `PUT`
 * @RouteParams {id: mongoose.Types.ObjectId}
 * @Body {name*: string} `Application/JSON`
 * @ACL Private
 * @ResponseBody `JSEND` 200
 */
export const putUpdateSpecificBrand: RequestHandler = async (req, res) => {
  const brandId = req.params.id;
  const updatedBrand = await Brand.findByIdAndUpdate(brandId, req.body, {
    new: true,
  });

  responses.success(updatedBrand, res, 200);
};

/**
 * Delete Specific Brand By Id
 *
 * @EndPoint /brands/:id `DELETE`
 * @RouteParams {id: mongoose.Types.ObjectId}
 * @ACL Private
 * @ResponseBody `NO_CONTENT` 204
 */
export const deleteSpecificBrand: RequestHandler = async (req, res) => {
  const brandId = req.params.id;

  await Brand.findByIdAndDelete(brandId);

  responses.success(null, res, 204);
};
