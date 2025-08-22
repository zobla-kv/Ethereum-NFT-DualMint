import { NextFunction, Request, Response } from 'express';
import ApiError from '../../lib/ApiError';

const defaultError = 'Something went wrong. Please try again.';
const defaultStatus = 500;

export default function errorHandler(err: Error, _: Request, res: Response, __: NextFunction) {
  if (err instanceof ApiError) {
    // logger
    console.error(err.stack);

    const { error, status } = err.response;
    res.status(status).json({ error, status }); //TODO: [ApiError] send message back also
    return;
  }

  res.status(defaultStatus).json({ error: defaultError });
}
