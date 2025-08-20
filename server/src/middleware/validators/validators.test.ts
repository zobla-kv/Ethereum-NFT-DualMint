import { validatePrompt } from './validators';
import ApiError from '../../lib/ApiError';

describe('validatePrompt middleware', () => {
  const middleware = validatePrompt('[API][METHOD]');

  let req: any, res: any, next: jest.Mock;

  beforeEach(() => {
    req = { body: {} };
    res = {};
    next = jest.fn();
  });

  it('calls next() for valid prompt', () => {
    req.body.prompt = 'ValidPrompt123';
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(ApiError) for invalid prompt', () => {
    req.body.prompt = '!!!';
    middleware(req, res, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(ApiError);
    expect(next.mock.calls[0][0].message).toContain('Invalid parameter');
  });
});
