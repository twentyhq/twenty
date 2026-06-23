import { pickScalarPropertiesFromEntity } from 'src/engine/metadata-modules/flat-entity/utils/pick-scalar-properties-from-entity.util';
import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromConnectionProviderEntityToFlatConnectionProvider = (
  args: FromEntityToFlatEntityArgs<'connectionProvider'>,
): FlatConnectionProvider => {
  const { entity: connectionProviderEntity } = args;

  const connectionProviderEntityWithoutRelations =
    pickScalarPropertiesFromEntity({
      metadataName: 'connectionProvider',
      entity: connectionProviderEntity,
    });

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
