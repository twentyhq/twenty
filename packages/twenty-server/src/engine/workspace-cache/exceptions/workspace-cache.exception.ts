import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export class WorkspaceCacheException extends CustomException<
  keyof typeof WorkspaceCacheExceptionCode
> {}

export const WorkspaceCacheExceptionCode = appendCommonExceptionCode({
  MISSING_DECORATOR: 'MISSING_DECORATOR',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
} as const);
