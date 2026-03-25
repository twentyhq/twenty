import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromLogicFunctionEntityToFlatLogicFunction = ({
  entity: logicFunctionEntity,
  applicationIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'logicFunction'>): FlatLogicFunction => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      logicFunctionEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${logicFunctionEntity.applicationId} not found for logicFunction ${logicFunctionEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const logicFunctionWithoutRelations = removePropertiesFromRecord(
    logicFunctionEntity,
    getMetadataEntityRelationProperties('logicFunction'),
  );

  return {
    ...logicFunctionWithoutRelations,
    createdAt: logicFunctionEntity.createdAt.toISOString(),
    updatedAt: logicFunctionEntity.updatedAt.toISOString(),
    deletedAt: logicFunctionEntity.deletedAt?.toISOString() ?? null,
    applicationUniversalIdentifier,
  };
};
