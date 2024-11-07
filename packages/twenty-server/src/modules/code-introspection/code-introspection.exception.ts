import { CustomException } from 'src/utils/custom-exception';

export class CodeIntrospectionException extends CustomException {
  code: CodeIntrospectionExceptionCode;
  constructor(message: string, code: CodeIntrospectionExceptionCode) {
    super(message, code);
  }
}

export enum CodeIntrospectionExceptionCode {
  ONLY_ONE_FUNCTION_ALLOWED = 'ONLY_ONE_FUNCTION_ALLOWED',
}
