import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatMessagingProvider } from 'src/engine/metadata-modules/flat-messaging-provider/types/flat-messaging-provider.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromMessagingProviderEntityToFlatMessagingProvider = (
  args: FromEntityToFlatEntityArgs<'messagingProvider'>,
): FlatMessagingProvider => {
  const { entity: messagingProviderEntity } = args;

  const messagingProviderScalarEntity = fromEntityToScalarEntity({
    metadataName: 'messagingProvider',
    entity: messagingProviderEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'messagingProvider',
      ...args,
    });

  return {
    ...messagingProviderScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
