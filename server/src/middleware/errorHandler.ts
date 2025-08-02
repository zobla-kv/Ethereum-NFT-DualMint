import { NextFunction, Request, Response } from 'express';
import ApiError from '../lib/ApiError';

const defaultError = 'Something went wrong. Please try again.';
const defaultStatus = 500;

export default function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    // logger
    console.error(err.stack);

    const { error, status } = err.response;
    res.status(status).json({ error });
    return;
  }

  res.status(defaultStatus).json({ error: defaultError });
}
