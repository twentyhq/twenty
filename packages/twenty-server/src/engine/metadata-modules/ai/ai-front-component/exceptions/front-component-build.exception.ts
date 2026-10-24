export class FrontComponentBuildException extends Error {
  constructor(
    message: string,
    readonly code: 'INVALID_INPUT' | 'BUILD_FAILED',
  ) {
    super(message);
    this.name = 'FrontComponentBuildException';
  }
}
