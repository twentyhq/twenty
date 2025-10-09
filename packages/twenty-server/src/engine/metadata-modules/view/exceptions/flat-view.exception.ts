import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export class FlatViewException extends CustomException<
  keyof typeof FlatViewExceptionCode
> {}

export const FlatViewExceptionCode = appendCommonExceptionCode({
  VIEW_NOT_FOUND: 'VIEW_NOT_FOUND',
  VIEW_ALREADY_EXISTS: 'VIEW_ALREADY_EXISTS',
} as const);
