import { type FlatEventMetadata } from 'src/engine/metadata-modules/flat-event-metadata/types/flat-event-metadata.type';
import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromEventMetadataEntityToFlatEventMetadata = (
  args: FromEntityToFlatEntityArgs<'eventMetadata'>,
): FlatEventMetadata => {
  const { entity: eventMetadataEntity } = args;

  const eventMetadataScalarEntity = fromEntityToScalarEntity({
    metadataName: 'eventMetadata',
    entity: eventMetadataEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'eventMetadata',
      ...args,
    });

  return {
    ...eventMetadataScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
