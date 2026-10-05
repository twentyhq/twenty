import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { WorkspaceMigrationV2ExceptionCode } from 'twenty-shared/metadata';

import { type FlatEntityMapsExceptionContext } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

const workspaceMigrationV2ExceptionUserFriendlyMessages: Partial<
  Record<WorkspaceMigrationV2ExceptionCode, MessageDescriptor>
> = {};

const defaultUserFriendlyMessage = msg`An error occurred during workspace migration.`;
const WORKSPACE_MIGRATION_V2_EXCEPTION_CATEGORY_BY_CODE = {
  [WorkspaceMigrationV2ExceptionCode.BUILDER_INTERNAL_SERVER_ERROR]:
    'INTERNAL_SERVER_ERROR',
  [WorkspaceMigrationV2ExceptionCode.RUNNER_INTERNAL_SERVER_ERROR]:
    'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  WorkspaceMigrationV2ExceptionCode,
  ExceptionCategory
>;

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
      category: WORKSPACE_MIGRATION_V2_EXCEPTION_CATEGORY_BY_CODE[code],
    });

    this.context = context;
  }
}
