import { ApiErrorResponse } from '@nft/types/ApiResponse';

type InternalMessage = `[${string}][${string}]: ${string}`;

class ApiError extends Error {
  private readonly _name = 'ApiError';
  private readonly _response: ApiErrorResponse;

  constructor(internalMessage: InternalMessage, response: ApiErrorResponse) {
    super(internalMessage);
    this._response = response;
  }

  get name(): string {
    return this._name;
  }

  get response(): ApiErrorResponse {
    return this._response;
  }
}

export default ApiError;
