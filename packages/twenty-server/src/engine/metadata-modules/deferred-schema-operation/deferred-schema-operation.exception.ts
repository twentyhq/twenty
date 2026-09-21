import { type MessageDescriptor } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const DeferredSchemaOperationExceptionCode = appendCommonExceptionCode({
  INDEX_METADATA_NOT_FOUND_IN_CACHE: 'INDEX_METADATA_NOT_FOUND_IN_CACHE',
  OPERATIONS_FAILED: 'OPERATIONS_FAILED',
} as const);

const getDeferredSchemaOperationExceptionUserFriendlyMessage = (
  code: keyof typeof DeferredSchemaOperationExceptionCode,
) => {
  switch (code) {
    case DeferredSchemaOperationExceptionCode.INDEX_METADATA_NOT_FOUND_IN_CACHE:
    case DeferredSchemaOperationExceptionCode.OPERATIONS_FAILED:
    case DeferredSchemaOperationExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

export class DeferredSchemaOperationException extends CustomException<
  keyof typeof DeferredSchemaOperationExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof DeferredSchemaOperationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getDeferredSchemaOperationExceptionUserFriendlyMessage(code),
    });
  }
}
