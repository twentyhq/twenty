import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable, CustomError } from 'twenty-shared/utils';

export const WorkspaceDataSourceExceptionCode = {
  DDL_LOCKED: 'DDL_LOCKED',
} as const;

const getWorkspaceDataSourceExceptionUserFriendlyMessage = (
  code: keyof typeof WorkspaceDataSourceExceptionCode,
) => {
  switch (code) {
    case WorkspaceDataSourceExceptionCode.DDL_LOCKED:
      return msg`Workspace schema changes are temporarily locked.`;
    default:
      assertUnreachable(code);
  }
};

export class WorkspaceDataSourceException extends CustomError {
  code: keyof typeof WorkspaceDataSourceExceptionCode;
  userFriendlyMessage: MessageDescriptor;

  constructor({
    message,
    code,
    userFriendlyMessage,
  }: {
    message: string;
    code: keyof typeof WorkspaceDataSourceExceptionCode;
    userFriendlyMessage?: MessageDescriptor;
  }) {
    super(message);
    this.code = code;
    this.userFriendlyMessage =
      userFriendlyMessage ??
      getWorkspaceDataSourceExceptionUserFriendlyMessage(code);
  }
}
