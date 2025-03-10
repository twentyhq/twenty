export class NameIsReservedKeywordException extends Error {
  constructor(name: string) {
    const message = `The name "${name}" is not available`;

    super(message);
  }
}
