import { isDefined } from 'twenty-shared/utils';

import { type FlatLogicFunctionMaps } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function-maps.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const findApplicationFlatLogicFunction = ({
  flatLogicFunctionMaps,
  universalIdentifier,
  applicationId,
}: {
  flatLogicFunctionMaps: Pick<FlatLogicFunctionMaps, 'byUniversalIdentifier'>;
  universalIdentifier: string | null;
  applicationId: string;
}): FlatLogicFunction | undefined => {
  if (!isDefined(universalIdentifier)) {
    return undefined;
  }

  const flatLogicFunction =
    flatLogicFunctionMaps.byUniversalIdentifier[universalIdentifier];

  if (
    !isDefined(flatLogicFunction) ||
    isDefined(flatLogicFunction.deletedAt) ||
    flatLogicFunction.applicationId !== applicationId
  ) {
    return undefined;
  }

  return flatLogicFunction;
};
