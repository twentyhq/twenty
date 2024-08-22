export class InvalidStringException extends Error {
  constructor(string: string) {
    const message = `String "${string}" is not valid`;

    super(message);
  }
}
