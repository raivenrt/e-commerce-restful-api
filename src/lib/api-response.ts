import type { Response } from 'express';

export enum STATUS {
  SUCCESS = 'success',
  FAILED = 'fail',
  ERROR = 'error',
}

export type ResponseT =
  | {
      status: STATUS.SUCCESS;
      data: object | null;
    }
  | {
      status: STATUS.FAILED;
      data: object;
    }
  | {
      status: STATUS.ERROR;
      message: string;
    };

export const responses = {
  success(
    data: object | null = null,
    response: Response,
    statusCode: number = 200,
  ): ResponseT {
    const responseJson: ResponseT = {
      status: STATUS.SUCCESS,
      data,
    };
    response.status(statusCode).json(responseJson);
    return responseJson;
  },

  failed(data: object, response: Response, statusCode: number): ResponseT {
    const responseJson: ResponseT = {
      status: STATUS.FAILED,
      data,
    };
    response.status(statusCode).json(responseJson);
    return responseJson;
  },

  error(message: string, response: Response, statusCode: number = 500): ResponseT {
    const responseJson: ResponseT = {
      status: STATUS.ERROR,
      message,
    };
    response.status(statusCode).json(responseJson);
    return responseJson;
  },
};
