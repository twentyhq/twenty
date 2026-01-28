import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const fromLogicFunctionEntityToFlatLogicFunction = (
  logicFunctionEntity: LogicFunctionEntity,
): FlatLogicFunction => {
  const logicFunctionWithoutRelations = removePropertiesFromRecord(
    logicFunctionEntity,
    ['logicFunctionLayer', 'application'],
  );

  return {
    ...logicFunctionWithoutRelations,
    createdAt: logicFunctionEntity.createdAt.toISOString(),
    updatedAt: logicFunctionEntity.updatedAt.toISOString(),
    deletedAt: logicFunctionEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier: logicFunctionEntity.universalIdentifier,
  };
};
