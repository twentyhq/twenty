export class CustomException extends Error {
  code: string;
  userFriendlyMessage?: string;

  constructor(message: string, code: string, userFriendlyMessage?: string) {
    super(message);
    this.code = code;
    this.userFriendlyMessage = userFriendlyMessage;
  }
}
