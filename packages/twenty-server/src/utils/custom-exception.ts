export class CustomException extends Error {
  code: string;
  errorFrontEndMessage?: string;

  constructor(message: string, code: string, errorFrontEndMessage?: string) {
    super(message);
    this.code = code;
    this.errorFrontEndMessage = errorFrontEndMessage;
  }
}
