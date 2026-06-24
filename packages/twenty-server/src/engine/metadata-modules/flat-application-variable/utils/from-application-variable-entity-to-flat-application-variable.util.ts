import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromApplicationVariableEntityToFlatApplicationVariable = (
  args: FromEntityToFlatEntityArgs<'applicationVariable'>,
): FlatApplicationVariable => {
  const { entity: applicationVariableEntity } = args;

  const applicationVariableScalarEntity = fromEntityToScalarEntity({
    metadataName: 'applicationVariable',
    entity: applicationVariableEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'applicationVariable',
      ...args,
    });

  return {
    ...applicationVariableScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
