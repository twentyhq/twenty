import { isDefined } from 'twenty-shared/utils';

import { pickScalarPropertiesFromEntity } from 'src/engine/metadata-modules/flat-entity/utils/pick-scalar-properties-from-entity.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { fromViewOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-view/utils/from-view-overrides-to-universal-overrides.util';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromViewEntityToFlatView = (
  args: FromEntityToFlatEntityArgs<'view'>,
): FlatView => {
  const { entity: viewEntity, fieldMetadataIdToUniversalIdentifierMap } = args;

  const viewEntityWithoutRelations = pickScalarPropertiesFromEntity({
    metadataName: 'view',
    entity: viewEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'view',
      ...args,
    });

  const universalOverrides = isDefined(viewEntity.overrides)
    ? fromViewOverridesToUniversalOverrides({
        overrides: viewEntity.overrides,
        fieldMetadataUniversalIdentifierById: Object.fromEntries(
          fieldMetadataIdToUniversalIdentifierMap.entries(),
        ),
        shouldThrowOnMissingIdentifier: false,
      })
    : null;

  return {
    ...viewEntityWithoutRelations,
    createdAt: viewEntity.createdAt.toISOString(),
    updatedAt: viewEntity.updatedAt.toISOString(),
    deletedAt: viewEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier: viewEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
    universalOverrides,
    viewFieldIds: viewEntity.viewFields.map(({ id }) => id),
    viewFieldGroupIds: viewEntity.viewFieldGroups?.map(({ id }) => id) ?? [],
    viewFilterIds: viewEntity.viewFilters.map(({ id }) => id),
    viewGroupIds: viewEntity.viewGroups.map(({ id }) => id),
    viewFilterGroupIds: viewEntity.viewFilterGroups?.map(({ id }) => id) ?? [],
    viewFieldUniversalIdentifiers: viewEntity.viewFields.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    viewFieldGroupUniversalIdentifiers:
      viewEntity.viewFieldGroups?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    viewFilterUniversalIdentifiers: viewEntity.viewFilters.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    viewGroupUniversalIdentifiers: viewEntity.viewGroups.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    viewFilterGroupUniversalIdentifiers:
      viewEntity.viewFilterGroups?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    viewSortIds: viewEntity.viewSorts?.map(({ id }) => id) ?? [],
    viewSortUniversalIdentifiers:
      viewEntity.viewSorts?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
  };
};
