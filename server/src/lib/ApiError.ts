type ApiInternalMessage = `[${string}][${string}]: ${string}`;

class ApiError extends Error {
  private readonly _name = 'ApiError';
  private readonly _status: number;

  constructor(message: ApiInternalMessage, status: number = 500) {
    super(message);
    this._status = status;
  }

  get name(): string {
    return this._name;
  }

  get status(): number {
    return this._status;
  }
}

export default ApiError;
