import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromViewFilterGroupEntityToFlatViewFilterGroup = (
  args: FromEntityToFlatEntityArgs<'viewFilterGroup'>,
): FlatViewFilterGroup => {
  const { entity: viewFilterGroupEntity } = args;

  const viewFilterGroupEntityWithoutRelations = fromEntityToScalarEntity({
    metadataName: 'viewFilterGroup',
    entity: viewFilterGroupEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'viewFilterGroup',
      ...args,
    });

  return {
    ...viewFilterGroupEntityWithoutRelations,
    ...relationUniversalIdentifiers,
    viewFilterIds: viewFilterGroupEntity.viewFilters?.map(({ id }) => id) ?? [],
    childViewFilterGroupIds:
      viewFilterGroupEntity.childViewFilterGroups?.map(({ id }) => id) ?? [],
    viewFilterUniversalIdentifiers:
      viewFilterGroupEntity.viewFilters?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    childViewFilterGroupUniversalIdentifiers:
      viewFilterGroupEntity.childViewFilterGroups?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
  };
};
