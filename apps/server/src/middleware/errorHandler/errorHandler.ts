import { NextFunction, Request, Response } from 'express';
import ApiError from '../../lib/ApiError';
import { ApiErrorResponse } from '@nft/types/ApiResponse';

const defaultError = 'Something went wrong. Please try again.';
const defaultStatus = 500;

// prettier-ignore
export default function errorHandler(err: Error, _: Request, res: Response, __: NextFunction) {
  if (err instanceof ApiError) {
    // logger
    console.error(err.stack);

    const { status, message } = err.response;
    const response: ApiErrorResponse = { status, message };
    res.status(status).json(response);
    return;
  }

  res.status(defaultStatus).json({ error: defaultError });
}
