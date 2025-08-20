import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export class WorkspaceMigrationRunnerException extends CustomException<
  keyof typeof WorkspaceMigrationRunnerExceptionCode
> {}

export const WorkspaceMigrationRunnerExceptionCode = appendCommonExceptionCode({
  FIELD_METADATA_NOT_FOUND: 'FIELD_METADATA_NOT_FOUND',
  OBJECT_METADATA_NOT_FOUND: 'OBJECT_METADATA_NOT_FOUND',
} as const);
