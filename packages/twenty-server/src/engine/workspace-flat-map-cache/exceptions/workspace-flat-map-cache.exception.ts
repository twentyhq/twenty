import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export class WorkspaceFlatMapCacheException extends CustomException<
  keyof typeof WorkspaceFlatMapCacheExceptionCode
> {}

export const WorkspaceFlatMapCacheExceptionCode = appendCommonExceptionCode({
  MISSING_DECORATOR: 'MISSING_DECORATOR',
} as const);
