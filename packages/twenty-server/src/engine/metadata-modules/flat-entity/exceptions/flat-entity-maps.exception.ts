import { type MessageDescriptor } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';
import { z } from 'zod';

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

export const flatEntityMapsExceptionContextSchema = z.strictObject({
  universalIdentifier: z.string().optional(),
  id: z.string().optional(),
  applicationId: z.string().optional(),
  metadataName: z.string().optional(),
  relatedMetadataName: z.string().optional(),
  operation: z.enum(['add', 'delete']).optional(),
});

export type FlatEntityMapsExceptionContext = z.infer<
  typeof flatEntityMapsExceptionContextSchema
>;

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
