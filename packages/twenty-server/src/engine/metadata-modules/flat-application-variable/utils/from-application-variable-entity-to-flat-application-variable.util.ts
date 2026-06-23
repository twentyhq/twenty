import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromApplicationVariableEntityToFlatApplicationVariable = (
  args: FromEntityToFlatEntityArgs<'applicationVariable'>,
): FlatApplicationVariable => {
  const { entity: applicationVariableEntity } = args;

  const applicationVariableEntityWithoutRelations = removePropertiesFromRecord(
    applicationVariableEntity,
    getMetadataEntityRelationProperties('applicationVariable'),
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'applicationVariable',
      ...args,
    });

  return {
    ...applicationVariableEntityWithoutRelations,
    createdAt: applicationVariableEntity.createdAt.toISOString(),
    updatedAt: applicationVariableEntity.updatedAt.toISOString(),
    universalIdentifier:
      applicationVariableEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
  };
};
