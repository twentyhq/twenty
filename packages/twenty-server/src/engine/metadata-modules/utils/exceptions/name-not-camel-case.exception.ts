export class NameIsNotInCamelCase extends Error {
  constructor(name: string) {
    const message = `Name should be in camelCase: ${name}`;

    super(message);
  }
}
