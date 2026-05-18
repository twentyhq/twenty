import { assertUnreachable } from 'twenty-shared/utils';

import { FlatEntityMapsExceptionCode } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';

export const flatEntityMapsExceptionCodeToHttpStatus = (
  code: keyof typeof FlatEntityMapsExceptionCode,
): number => {
  switch (code) {
    case FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND:
      return 404;
    case FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS:
      return 409;
    case FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND:
    case FlatEntityMapsExceptionCode.ENTITY_MALFORMED:
    case FlatEntityMapsExceptionCode.INTERNAL_SERVER_ERROR:
      return 500;
    default:
      return assertUnreachable(code);
  }
};
