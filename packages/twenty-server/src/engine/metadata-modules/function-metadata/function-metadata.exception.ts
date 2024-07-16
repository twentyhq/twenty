import { CustomException } from 'src/utils/custom-exception';

export class FunctionMetadataException extends CustomException {
  code: FunctionMetadataExceptionCode;
  constructor(message: string, code: FunctionMetadataExceptionCode) {
    super(message, code);
  }
}

export enum FunctionMetadataExceptionCode {
  FUNCTION_NOT_FOUND = 'FUNCTION_NOT_FOUND',
  FUNCTION_ALREADY_EXIST = 'FUNCTION_ALREADY_EXIST',
  FUNCTION_NOT_READY = 'FUNCTION_NOT_READY',
}
