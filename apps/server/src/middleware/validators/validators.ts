import { Request, Response, NextFunction } from 'express';
import ApiError from '../../lib/ApiError';

export function validatePrompt(context: `[${string}][${string}]`) {
  return (req: Request, _: Response, next: NextFunction): void => {
    const { prompt } = req.body;

    const regex = /^[a-zA-Z0-9 ]{1,200}$/;

    if (!regex.test(prompt)) {
      next(
        new ApiError(`${context}: Invalid parameter 'prompt': ${prompt}`, {
          status: 400,
          message:
            'Prompt can only contain letters, numbers, commas, and periods',
        })
      );
      return;
    }

    next();
  };
}
