export class NameNotAvailableException extends Error {
  constructor(name: string) {
    const message = `Name "${name}" is not available`;

    super(message);
  }
}
