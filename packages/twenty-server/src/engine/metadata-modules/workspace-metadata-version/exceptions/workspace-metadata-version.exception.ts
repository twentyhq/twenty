import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkspaceMetadataVersionExceptionCode {
  METADATA_VERSION_NOT_FOUND = 'METADATA_VERSION_NOT_FOUND',
}

const workspaceMetadataVersionExceptionUserFriendlyMessages: Record<
  WorkspaceMetadataVersionExceptionCode,
  MessageDescriptor
> = {
  [WorkspaceMetadataVersionExceptionCode.METADATA_VERSION_NOT_FOUND]: msg`Metadata version not found.`,
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
        workspaceMetadataVersionExceptionUserFriendlyMessages[code],
    });
  }
}
