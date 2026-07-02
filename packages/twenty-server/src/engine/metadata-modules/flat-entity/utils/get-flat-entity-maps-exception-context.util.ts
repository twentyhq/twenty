import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  flatEntityMapsExceptionContextSchema,
  type FlatEntityMapsExceptionContext,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';

export const getFlatEntityMapsExceptionContext = (
  error: unknown,
): FlatEntityMapsExceptionContext | undefined => {
  if (error instanceof FlatEntityMapsException) {
    return error.context;
  }

  if (isDefined(error) && typeof error === 'object' && 'context' in error) {
    const parsedContext = flatEntityMapsExceptionContextSchema.safeParse(
      (error as { context?: unknown }).context,
    );

    return parsedContext.success ? parsedContext.data : undefined;
  }

  return undefined;
};
