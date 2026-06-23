import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromViewFilterEntityToFlatViewFilter = (
  args: FromEntityToFlatEntityArgs<'viewFilter'>,
): FlatViewFilter => {
  const { entity: viewFilterEntity } = args;

  const viewFilterEntityWithoutRelations = removePropertiesFromRecord(
    viewFilterEntity,
    getMetadataEntityRelationProperties('viewFilter'),
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'viewFilter',
      ...args,
    });

  return {
    ...viewFilterEntityWithoutRelations,
    createdAt: viewFilterEntity.createdAt.toISOString(),
    updatedAt: viewFilterEntity.updatedAt.toISOString(),
    deletedAt: viewFilterEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier: viewFilterEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
  };
};
