// This class is used to group different error messages under the same code for sentry.
export class CustomError extends Error {
  public code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}
