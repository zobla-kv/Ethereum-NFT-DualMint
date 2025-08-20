import { NextFunction, Request, Response } from 'express';
import ApiError from '../../lib/ApiError';
import errorHandler from './errorHandler';

describe('errorHandler', () => {
  let res: Partial<Response>;
  let req: Partial<Request>;
  let next: NextFunction;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    req = {};
    next = jest.fn();
  });

  it('should log error stack and return appropriate response for ApiError', () => {
    const apiError = new ApiError('[API][METHOD]: [Internal Error]', {
      error: 'Response Error Message',
      status: 400,
    });

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    errorHandler(apiError, req as Request, res as Response, next);
    expect(consoleSpy).toHaveBeenCalledWith(apiError.stack);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Response Error Message' });

    consoleSpy.mockRestore();
  });

  it('should return default error response for generic errors', () => {
    const error = new Error('Some random error');

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Something went wrong. Please try again.',
    });
  });
});
