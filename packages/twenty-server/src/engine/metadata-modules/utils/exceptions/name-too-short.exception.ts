export class NameTooShortException extends Error {
  constructor(name: string) {
    const message = `Input is too short: ${name}`;

    super(message);
  }
}
