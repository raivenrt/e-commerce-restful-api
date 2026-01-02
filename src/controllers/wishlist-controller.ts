import type { RequestHandler, Request } from 'express';

import User from '@models/user-model.js';
import { responses } from '@lib/api-response.js';

const updateWishlist = async (
  req: Request,
  type: 'add' | 'remove',
  productId: string,
) => {
  const { user } = req.auth!;
  const uid = user._id;

  const updatedUser = await User.findOneAndUpdate(
    { _id: uid },
    { [type === 'add' ? '$addToSet' : '$pull']: { wishlist: productId } },
    { new: true },
  );

  return updatedUser!.wishlist;
};

/**
 * Add product to wishlist
 *
 * @route `(/wishlist)` POST
 * @acl User
 * @body `{ productId: Product.ObjectId }` Application/JSON
 * @response JSEND 200
 */

export const postAddToWishlist: RequestHandler = async (req, res) => {
  const { productId } = req.body;
  const updatedWishlist = await updateWishlist(req, 'add', productId);

  responses.success(
    {
      wishlist: updatedWishlist,
      message: 'Product added to wishlist successfully',
    },
    res,
    200,
  );
};

/**
 * Remove product from wishlist
 *
 * @route `(/wishlist)` POST
 * @acl User
 * @body `{ productId: Product.ObjectId }` Application/JSON
 * @response JSEND 200
 */
export const deleteProductInWishlist: RequestHandler = async (req, res) => {
  const { id: productId } = req.params;
  const updatedWishlist = await updateWishlist(
    req,
    'remove',
    productId?.toString() ?? '',
  );

  responses.success(
    {
      wishlist: updatedWishlist,
      message: 'Product removed from wishlist successfully',
    },
    res,
    200,
  );
};

/**
 * Remove product from wishlist
 *
 * @route `(/wishlist)` POST
 * @acl User
 * @body `{ productId: Product.ObjectId }` Application/JSON
 * @response JSEND 200
 */
export const getLoggedUserWishlist: RequestHandler = async (req, res) => {
  const { user } = req.auth!;
  const wishlist = user.wishlist;

  responses.success(
    {
      wishlist,
    },
    res,
    200,
  );
};
