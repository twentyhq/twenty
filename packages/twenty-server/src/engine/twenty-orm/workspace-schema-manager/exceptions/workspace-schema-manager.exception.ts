import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export class WorkspaceSchemaManagerException extends CustomException<
  keyof typeof WorkspaceSchemaManagerExceptionCode
> {}

export const WorkspaceSchemaManagerExceptionCode = appendCommonExceptionCode({
  ENUM_OPERATION_FAILED: 'ENUM_OPERATION_FAILED',
} as const);
