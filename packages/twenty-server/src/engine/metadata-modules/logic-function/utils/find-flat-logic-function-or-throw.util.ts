import { isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export const findFlatLogicFunctionOrThrow = ({
  flatLogicFunctionMaps,
  id,
}: {
  flatLogicFunctionMaps: MetadataFlatEntityMaps<'logicFunction'>;
  id: string;
}) => {
  const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: id,
    flatEntityMaps: flatLogicFunctionMaps,
  });

  if (!isDefined(flatLogicFunction) || isDefined(flatLogicFunction.deletedAt)) {
    throw new LogicFunctionException(
      `Logic function with id ${id} not found`,
      LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    );
  }

  return flatLogicFunction;
};
