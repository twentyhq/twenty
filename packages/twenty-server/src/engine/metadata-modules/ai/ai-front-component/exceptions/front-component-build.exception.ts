import { CustomError } from 'twenty-shared/utils';

type FrontComponentBuildExceptionCode =
  | 'INVALID_INPUT'
  | 'INVALID_SETTINGS'
  | 'BUILD_FAILED'
  | 'BUILD_TIMEOUT'
  | 'OUTPUT_TOO_LARGE';

export class FrontComponentBuildException extends CustomError {
  declare code: FrontComponentBuildExceptionCode;

  constructor({
    message,
    code,
  }: {
    message: string;
    code: FrontComponentBuildExceptionCode;
  }) {
    super(message, code);
    this.name = 'FrontComponentBuildException';
  }
}
