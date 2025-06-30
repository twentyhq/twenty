export class CustomException extends Error {
  code: string;
  displayedErrorMessage?: string;

  constructor(message: string, code: string, displayedErrorMessage?: string) {
    super(message);
    this.code = code;
    this.displayedErrorMessage = displayedErrorMessage;
  }
}
