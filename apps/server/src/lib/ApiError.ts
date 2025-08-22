type InternalMessage = `[${string}][${string}]: ${string}`;

type ApiErrorKey = 'invalidInput' | 'default';

interface ApiErrorResponse {
  error: string;
  status: number;
}

class ApiError extends Error {
  private readonly _name = 'ApiError';
  private readonly _response: ApiErrorResponse;

  public static readonly errors: Record<ApiErrorKey, ApiErrorResponse> = {
    invalidInput: {
      error: 'Invalid input',
      status: 400,
    },
    default: {
      error: 'Something went wrong. Please try again.',
      status: 500,
    },
  };

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
