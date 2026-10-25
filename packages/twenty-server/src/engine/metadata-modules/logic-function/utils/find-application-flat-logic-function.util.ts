import { isDefined } from 'twenty-shared/utils';

import { type FlatLogicFunctionMaps } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function-maps.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const findApplicationFlatLogicFunction = ({
  flatLogicFunctionMaps,
  universalIdentifier,
  applicationId,
}: {
  flatLogicFunctionMaps: Pick<FlatLogicFunctionMaps, 'byUniversalIdentifier'>;
  universalIdentifier: string;
  applicationId: string;
}): FlatLogicFunction | undefined => {
  const flatLogicFunction =
    flatLogicFunctionMaps.byUniversalIdentifier[universalIdentifier];

  return isDefined(flatLogicFunction) &&
    !isDefined(flatLogicFunction.deletedAt) &&
    flatLogicFunction.applicationId === applicationId
    ? flatLogicFunction
    : undefined;
};
