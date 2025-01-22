export class CustomException extends Error {
  code: string;
  metadata?: Record<string, string>;

  constructor(
    message: string,
    code: string,
    metadata?: Record<string, string>,
  ) {
    super(message);
    this.code = code;
    this.metadata = metadata;
  }
}
