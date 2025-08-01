import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export class DistantTableException extends CustomException<
  keyof typeof DistantTableExceptionCode
> {}

export const DistantTableExceptionCode = appendCommonExceptionCode({
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const);
