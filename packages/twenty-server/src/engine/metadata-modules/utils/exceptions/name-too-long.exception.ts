export class NameTooLongException extends Error {
  constructor(string: string) {
    const message = `String "${string}" exceeds 63 characters limit`;

    super(message);
  }
}
