import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  type FlatEntityMapsExceptionContext,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';

// Extracts the structured context originally attached to a FlatEntityMapsException,
// whether the error is the exception itself or a wrapper exception that forwarded
// the context (runner / build orchestrator re-wraps keep it on a `context` field).
export const getFlatEntityMapsExceptionContext = (
  error: unknown,
): FlatEntityMapsExceptionContext | undefined => {
  if (error instanceof FlatEntityMapsException) {
    return error.context;
  }

  if (
    isDefined(error) &&
    typeof error === 'object' &&
    'context' in error &&
    isDefined((error as { context?: unknown }).context)
  ) {
    return (error as { context?: FlatEntityMapsExceptionContext }).context;
  }

  return undefined;
};
