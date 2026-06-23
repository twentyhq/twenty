import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromLogicFunctionEntityToFlatLogicFunction = (
  args: FromEntityToFlatEntityArgs<'logicFunction'>,
): FlatLogicFunction => {
  const { entity: logicFunctionEntity } = args;

  const logicFunctionScalarEntity = fromEntityToScalarEntity({
    metadataName: 'logicFunction',
    entity: logicFunctionEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'logicFunction',
      ...args,
    });

  return {
    ...logicFunctionScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
