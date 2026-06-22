import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-cache/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromConnectionProviderEntityToFlatConnectionProvider = (
  args: FromEntityToFlatEntityArgs<'connectionProvider'>,
): FlatConnectionProvider => {
  const { entity: connectionProviderEntity } = args;

  const connectionProviderEntityWithoutRelations = removePropertiesFromRecord(
    connectionProviderEntity,
    getMetadataEntityRelationProperties('connectionProvider'),
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'connectionProvider',
      ...args,
    });

  return {
    ...connectionProviderEntityWithoutRelations,
    createdAt: connectionProviderEntity.createdAt.toISOString(),
    updatedAt: connectionProviderEntity.updatedAt.toISOString(),
    universalIdentifier:
      connectionProviderEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
  };
};
