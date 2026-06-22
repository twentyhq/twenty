import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-cache/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromLogicFunctionEntityToFlatLogicFunction = (
  args: FromEntityToFlatEntityArgs<'logicFunction'>,
): FlatLogicFunction => {
  const { entity: logicFunctionEntity } = args;

  const logicFunctionWithoutRelations = removePropertiesFromRecord(
    logicFunctionEntity,
    getMetadataEntityRelationProperties('logicFunction'),
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'logicFunction',
      ...args,
    });

  return {
    ...logicFunctionWithoutRelations,
    createdAt: logicFunctionEntity.createdAt.toISOString(),
    updatedAt: logicFunctionEntity.updatedAt.toISOString(),
    deletedAt: logicFunctionEntity.deletedAt?.toISOString() ?? null,
    ...relationUniversalIdentifiers,
  };
};
