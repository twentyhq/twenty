import { pickScalarPropertiesFromEntity } from 'src/engine/metadata-modules/flat-entity/utils/pick-scalar-properties-from-entity.util';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromViewSortEntityToFlatViewSort = (
  args: FromEntityToFlatEntityArgs<'viewSort'>,
): FlatViewSort => {
  const { entity: viewSortEntity } = args;

  const viewSortEntityWithoutRelations = pickScalarPropertiesFromEntity({
    metadataName: 'viewSort',
    entity: viewSortEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'viewSort',
      ...args,
    });

  return {
    ...viewSortEntityWithoutRelations,
    createdAt: viewSortEntity.createdAt.toISOString(),
    updatedAt: viewSortEntity.updatedAt.toISOString(),
    deletedAt: viewSortEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier: viewSortEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
  };
};
