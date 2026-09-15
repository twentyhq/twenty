import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  flatEntityMapsExceptionContextSchema,
  type FlatEntityMapsExceptionContext,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';

const hasFlatEntityIdentifier = (
  context: FlatEntityMapsExceptionContext,
): boolean => isDefined(context.universalIdentifier) || isDefined(context.id);

export const getFlatEntityMapsExceptionContext = (
  error: unknown,
): FlatEntityMapsExceptionContext | undefined => {
  if (error instanceof FlatEntityMapsException) {
    return isDefined(error.context) && hasFlatEntityIdentifier(error.context)
      ? error.context
      : undefined;
  }

  if (isDefined(error) && typeof error === 'object' && 'context' in error) {
    const parsedContext = flatEntityMapsExceptionContextSchema.safeParse(
      (error as { context?: unknown }).context,
    );

    return parsedContext.success && hasFlatEntityIdentifier(parsedContext.data)
      ? parsedContext.data
      : undefined;
  }

  return undefined;
};
