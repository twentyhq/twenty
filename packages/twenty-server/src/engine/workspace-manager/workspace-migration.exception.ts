import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type WorkspaceMigrationV2ExceptionCode } from 'twenty-shared/metadata';

import { type FlatEntityMapsExceptionContext } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { CustomException } from 'src/utils/custom-exception';

const workspaceMigrationV2ExceptionUserFriendlyMessages: Partial<
  Record<WorkspaceMigrationV2ExceptionCode, MessageDescriptor>
> = {};

const defaultUserFriendlyMessage = msg`An error occurred during workspace migration.`;

export class WorkspaceMigrationV2Exception extends CustomException<WorkspaceMigrationV2ExceptionCode> {
  context?: FlatEntityMapsExceptionContext;

  constructor(
    message: string,
    code: WorkspaceMigrationV2ExceptionCode,
    {
      userFriendlyMessage,
      context,
    }: {
      userFriendlyMessage?: MessageDescriptor;
      context?: FlatEntityMapsExceptionContext;
    } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        workspaceMigrationV2ExceptionUserFriendlyMessages[code] ??
        defaultUserFriendlyMessage,
    });

    this.context = context;
  }
}
