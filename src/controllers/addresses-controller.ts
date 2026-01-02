import type { RequestHandler, Request } from 'express';

import User from '@models/user-model.js';
import { responses } from '@lib/api-response.js';

/**
 * Add new user address
 *
 * @route `(/addresses)` POST
 * @acl User
 * @body `{ 
    alias: string;
    details: string;
    phone: string;
    pincode: number;
    city: string;
    state: string;
    country: string;
  }` Application/JSON
 * @response JSEND 200
 */

export const postAddAddress: RequestHandler = async (req, res) => {
  const { user } = req.auth!;
  const uid = user._id;

  const updatedUser = await User.findOneAndUpdate(
    { _id: uid },
    { $addToSet: { addresses: req.body } },
    { new: true },
  );

  responses.success(
    {
      addresses: updatedUser!.addresses,
      message: 'New address added successfully',
    },
    res,
    200,
  );
};

/**
 * Remove address from list
 *
 * @route `(/addresses/:id)` Delete
 * @acl User
 * @params `{ id: User.addresses.ObjectId }` Application/JSON
 * @response JSEND 200
 */
export const deleteUserAddress: RequestHandler = async (req, res) => {
  const { id: addressId } = req.params;

  const { user } = req.auth!;
  const uid = user._id;

  const updatedUser = await User.findOneAndUpdate(
    { _id: uid },
    { $pull: { addresses: { _id: addressId } } },
    { new: true },
  );

  responses.success(
    {
      wishlist: updatedUser!.addresses,
      message: 'address removed successfully',
    },
    res,
    200,
  );
};

/**
 * Get specific address
 *
 * @route `(/addresses/:id)` Get
 * @acl User
 * @params `{ id: User.addresses.ObjectId }` Application/JSON
 * @response JSEND 200
 */
export const getSpecificUserAddress: RequestHandler = async (req, res) => {
  const { id: addressId } = req.params;
  const { user } = req.auth!;

  const address = user.addresses.find((address) => address._id.toString() === addressId);

  if (!address) return responses.failed({ message: 'address not found' }, res, 400);

  responses.success(address, res, 200);
};

/**
 * List logged user addresses
 *
 * @route `(/addresses)` GET
 * @acl User
 * @response JSEND 200
 */
export const getLoggedUserAddresses: RequestHandler = async (req, res) => {
  const { user } = req.auth!;
  const addresses = user.addresses;

  responses.success(
    {
      addresses,
    },
    res,
    200,
  );
};
