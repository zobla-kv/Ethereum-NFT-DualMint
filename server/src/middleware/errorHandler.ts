import { NextFunction, Request, Response } from 'express';
import ApiError from '../lib/ApiError';

const defaultStatus = 500;
const defaultMessage = 'Something went wrong. Please try again.';

export default function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    // logger
    console.error(err);
  }

  res.status(defaultStatus).json({
    error: defaultMessage,
  });
}
