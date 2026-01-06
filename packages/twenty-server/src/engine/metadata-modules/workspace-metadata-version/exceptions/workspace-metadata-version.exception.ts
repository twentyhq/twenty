import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkspaceMetadataVersionExceptionCode {
  METADATA_VERSION_NOT_FOUND = 'METADATA_VERSION_NOT_FOUND',
}

const getWorkspaceMetadataVersionExceptionUserFriendlyMessage = (
  code: WorkspaceMetadataVersionExceptionCode,
) => {
  switch (code) {
    case WorkspaceMetadataVersionExceptionCode.METADATA_VERSION_NOT_FOUND:
      return msg`Metadata version not found.`;
    default:
      assertUnreachable(code);
  }
};

export class WorkspaceMetadataVersionException extends CustomException<WorkspaceMetadataVersionExceptionCode> {
  constructor(
    message: string,
    code: WorkspaceMetadataVersionExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getWorkspaceMetadataVersionExceptionUserFriendlyMessage(code),
    });
  }
}
