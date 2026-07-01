import { type MessageDescriptor } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const FlatEntityMapsExceptionCode = appendCommonExceptionCode({
  RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND:
    'RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND',
  ENTITY_ALREADY_EXISTS: 'ENTITY_ALREADY_EXISTS',
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  ENTITY_MALFORMED: 'ENTITY_MALFORMED',
} as const);

// Structured identifiers captured at the throw site so downstream layers
// (Sentry via the exception-handler `context` channel, and the app-sync layer
// that resolves them against the manifest) can act on the failure without
// parsing the message string. These are UUIDs / universal identifiers, not PII.
export type FlatEntityMapsExceptionContext = {
  universalIdentifier?: string;
  id?: string;
  applicationId?: string;
  metadataName?: string;
  relatedMetadataName?: string;
  operation?: 'add' | 'delete' | 'update' | 'replace';
};

const getFlatEntityMapsExceptionUserFriendlyMessage = (
  code: keyof typeof FlatEntityMapsExceptionCode,
) => {
  switch (code) {
    case FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND:
    case FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS:
    case FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND:
    case FlatEntityMapsExceptionCode.ENTITY_MALFORMED:
    case FlatEntityMapsExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

export class FlatEntityMapsException extends CustomException<
  keyof typeof FlatEntityMapsExceptionCode
> {
  // Read by the Sentry exception-handler driver (`'context' in exception`) and
  // by the app-sync layer to build a human-readable installation error.
  context?: FlatEntityMapsExceptionContext;

  constructor(
    message: string,
    code: keyof typeof FlatEntityMapsExceptionCode,
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
        getFlatEntityMapsExceptionUserFriendlyMessage(code),
    });

    this.context = context;
  }
}
